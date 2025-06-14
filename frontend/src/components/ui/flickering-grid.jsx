import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const FlickeringGrid = ({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "rgb(0, 0, 0)",
  width,
  height,
  className,
  maxOpacity = 0.3,
  ...props
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const isInViewRef = useRef(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const animationRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const intersectionObserverRef = useRef(null);

  const memoizedColor = useMemo(() => {
    const toRGBA = (color) => {
      if (typeof window === "undefined") {
        return `rgba(0, 0, 0,`;
      }
      try {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext("2d");
        if (!ctx) return "rgba(255, 0, 0,";
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
        return `rgba(${r}, ${g}, ${b},`;
      } catch (error) {
        console.warn('Error processing color:', error);
        return `rgba(0, 0, 0,`;
      }
    };
    return toRGBA(color);
  }, [color]);

  const setupCanvas = useCallback(
    (canvas, width, height) => {
      try {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const cols = Math.floor(width / (squareSize + gridGap));
        const rows = Math.floor(height / (squareSize + gridGap));

        const squares = new Float32Array(cols * rows);
        for (let i = 0; i < squares.length; i++) {
          squares[i] = Math.random() * maxOpacity;
        }

        return { cols, rows, squares, dpr };
      } catch (error) {
        console.warn('Error setting up canvas:', error);
        return { cols: 0, rows: 0, squares: new Float32Array(0), dpr: 1 };
      }
    },
    [squareSize, gridGap, maxOpacity],
  );

  const updateSquares = useCallback(
    (squares, deltaTime) => {
      try {
        for (let i = 0; i < squares.length; i++) {
          if (Math.random() < flickerChance * deltaTime) {
            squares[i] = Math.random() * maxOpacity;
          }
        }
      } catch (error) {
        console.warn('Error updating squares:', error);
      }
    },
    [flickerChance, maxOpacity],
  );

  const drawGrid = useCallback(
    (
      ctx,
      width,
      height,
      cols,
      rows,
      squares,
      dpr,
    ) => {
      try {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "transparent";
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const opacity = squares[i * rows + j];
            ctx.fillStyle = `${memoizedColor}${opacity})`;
            ctx.fillRect(
              i * (squareSize + gridGap) * dpr,
              j * (squareSize + gridGap) * dpr,
              squareSize * dpr,
              squareSize * dpr,
            );
          }
        }
      } catch (error) {
        console.warn('Error drawing grid:', error);
      }
    },
    [memoizedColor, squareSize, gridGap],
  );

  // Debounced resize handler
  const debouncedUpdateCanvasSize = useMemo(
    () => debounce((container, canvas) => {
      if (!container || !canvas) return;
      
      try {
        const newWidth = width || container.clientWidth;
        const newHeight = height || container.clientHeight;
        
        // Only update if size actually changed
        if (newWidth !== canvasSize.width || newHeight !== canvasSize.height) {
          setCanvasSize({ width: newWidth, height: newHeight });
        }
      } catch (error) {
        console.warn('Error updating canvas size:', error);
      }
    }, 100), // 100ms debounce
    [width, height, canvasSize.width, canvasSize.height]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let gridParams;

    const updateCanvasSize = () => {
      const newWidth = width || container.clientWidth;
      const newHeight = height || container.clientHeight;
      setCanvasSize({ width: newWidth, height: newHeight });
      gridParams = setupCanvas(canvas, newWidth, newHeight);
    };

    updateCanvasSize();

    let lastTime = 0;
    const animate = (time) => {
      if (!isInViewRef.current || !gridParams) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = Math.min((time - lastTime) / 1000, 0.1); // Cap deltaTime to prevent jumps
      lastTime = time;

      updateSquares(gridParams.squares, deltaTime);
      drawGrid(
        ctx,
        canvas.width,
        canvas.height,
        gridParams.cols,
        gridParams.rows,
        gridParams.squares,
        gridParams.dpr,
      );
      animationRef.current = requestAnimationFrame(animate);
    };

    // Enhanced ResizeObserver with error handling
    try {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        try {
          // Process resize with debouncing
          debouncedUpdateCanvasSize(container, canvas);
        } catch (error) {
          console.warn('ResizeObserver callback error:', error);
        }
      });

      resizeObserverRef.current.observe(container);
    } catch (error) {
      console.warn('ResizeObserver creation failed:', error);
      // Fallback to window resize event
      const handleResize = () => debouncedUpdateCanvasSize(container, canvas);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    // Enhanced IntersectionObserver with error handling
    try {
      intersectionObserverRef.current = new IntersectionObserver(
        ([entry]) => {
          setIsInView(entry.isIntersecting);
          isInViewRef.current = entry.isIntersecting;
        },
        { threshold: 0 },
      );

      intersectionObserverRef.current.observe(canvas);
    } catch (error) {
      console.warn('IntersectionObserver creation failed:', error);
      setIsInView(true); // Fallback to always visible
    }

    if (isInViewRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      // Clean up all observers and animations
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (resizeObserverRef.current) {
        try {
          resizeObserverRef.current.disconnect();
        } catch (error) {
          console.warn('Error disconnecting ResizeObserver:', error);
        }
      }
      
      if (intersectionObserverRef.current) {
        try {
          intersectionObserverRef.current.disconnect();
        } catch (error) {
          console.warn('Error disconnecting IntersectionObserver:', error);
        }
      }
    };
  }, [setupCanvas, updateSquares, drawGrid, width, height, debouncedUpdateCanvasSize]);

  return (
    <div
      ref={containerRef}
      className={cn(`h-full w-full ${className}`)}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      />
    </div>
  );
}; 