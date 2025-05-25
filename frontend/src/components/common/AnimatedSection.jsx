import { motion, useAnimation } from 'framer-motion';
import React, { useEffect, useCallback, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

/**
 * Component animation cho các phần tử trong trang - Optimized version
 * @param {Object} props
 * @param {React.ReactNode} props.children - Nội dung bên trong
 * @param {Object} props.variants - Custom variants animation
 * @param {string} props.className - CSS classes
 * @param {number} props.delay - Độ trễ của animation (giây)
 * @param {number} props.duration - Thời gian của animation (giây)
 * @param {Object} props.style - Custom CSS styles
 * @param {string} props.animation - Loại animation ('fadeIn' | 'slideUp' | 'slideRight' | 'slideLeft' | 'zoomIn' | 'rotateIn' | 'bounce' | 'custom')
 * @param {string} props.hoverEffect - Hiệu ứng hover ('zoom' | 'glow' | 'float' | 'pulse' | 'tilt' | 'none')
 * @param {boolean} props.once - Chỉ chạy animation một lần
 */

// Optimized animation variants with GPU acceleration
const animationVariants = {
  fadeIn: {
    hidden: { opacity: 0, transform: 'translate3d(0,0,0)' },
    visible: { 
      opacity: 1,
      transform: 'translate3d(0,0,0)',
      transition: { duration: 0.4, ease: "easeOut" } 
    }
  },
  slideUp: {
    hidden: { opacity: 0, transform: 'translate3d(0,20px,0)' },
    visible: { 
      opacity: 1, 
      transform: 'translate3d(0,0,0)',
      transition: { duration: 0.4, ease: "easeOut" } 
    }
  },
  slideRight: {
    hidden: { opacity: 0, transform: 'translate3d(-30px,0,0)' },
    visible: { 
      opacity: 1, 
      transform: 'translate3d(0,0,0)',
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  },
  slideLeft: {
    hidden: { opacity: 0, transform: 'translate3d(30px,0,0)' },
    visible: { 
      opacity: 1, 
      transform: 'translate3d(0,0,0)',
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  },
  zoomIn: {
    hidden: { opacity: 0, transform: 'translate3d(0,0,0) scale(0.9)' },
    visible: { 
      opacity: 1, 
      transform: 'translate3d(0,0,0) scale(1)',
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  },
  rotateIn: {
    hidden: { opacity: 0, transform: 'translate3d(0,0,0) rotate(-5deg) scale(0.95)' },
    visible: { 
      opacity: 1, 
      transform: 'translate3d(0,0,0) rotate(0deg) scale(1)',
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  },
  bounce: {
    hidden: { opacity: 0, transform: 'translate3d(0,50px,0)' },
    visible: { 
      opacity: 1, 
      transform: 'translate3d(0,0,0)',
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 15 
      } 
    }
  }
};

// Optimized hover effects with GPU acceleration
const getHoverEffects = (effect) => {
  switch (effect) {
    case 'zoom':
      return { transform: 'translate3d(0,0,0) scale(1.05)', transition: { duration: 0.3 } };
    case 'glow':
      return { 
        boxShadow: "0 0 15px rgba(10, 75, 62, 0.5)",
        transition: { duration: 0.3 } 
      };
    case 'float':
      return { transform: 'translate3d(0,-10px,0)', transition: { duration: 0.4, yoyo: Infinity, repeat: 1 } };
    case 'pulse':
      return { 
        transform: ['translate3d(0,0,0) scale(1)', 'translate3d(0,0,0) scale(1.03)', 'translate3d(0,0,0) scale(1)'],
        transition: { duration: 1.2, repeat: Infinity } 
      };
    case 'tilt':
      return { transform: 'translate3d(0,0,0) rotate(1deg)', transition: { duration: 0.2 } };
    default:
      return {};
  }
};

// Throttle function for performance
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

const AnimatedSection = ({ 
  children, 
  variants, 
  className = "w-full", 
  delay = 0,
  duration,
  style,
  animation = 'slideUp',
  hoverEffect = 'none',
  once = true,
  ...props
}) => {
  const controls = useAnimation();
  const elementRef = useRef(null);
  const hasAnimated = useRef(false);
  
  // Optimized intersection observer with throttling
  const [ref, inView] = useInView({
    triggerOnce: once,
    threshold: 0.1,
    rootMargin: '0px 0px -5% 0px', // Reduced margin for better performance
  });

  // Throttled animation trigger
  const triggerAnimation = useCallback(() => {
    const throttledFunction = throttle(() => {
      if (inView && (!once || !hasAnimated.current)) {
        controls.start("visible");
        hasAnimated.current = true;
      } else if (!once && !inView) {
        controls.start("hidden");
      }
    }, 16);  
    throttledFunction();
  }, [controls, inView, once]);

  useEffect(() => {
    triggerAnimation();
  }, [triggerAnimation]);

  // Will-change management for performance
  useEffect(() => {
    const element = elementRef.current;
    if (element && inView) {
      element.style.willChange = 'transform, opacity';
      
      // Clean up will-change after animation
      const timer = setTimeout(() => {
        if (element) {
          element.style.willChange = 'auto';
        }
      }, (duration || 0.6) * 1000 + (delay * 1000) + 100);
      
      return () => {
        clearTimeout(timer);
        if (element) {
          element.style.willChange = 'auto';
        }
      };
    }
  }, [inView, duration, delay]);

  // Select variants based on animation type
  let selectedVariants = variants;
  if (!variants && animation !== 'custom') {
    selectedVariants = animationVariants[animation];
  }

  // Make a copy of the variants to avoid mutation
  const customVariants = selectedVariants ? JSON.parse(JSON.stringify(selectedVariants)) : undefined;
  
  // Add delay or duration if provided
  if (customVariants && (delay > 0 || duration)) {
    if (!customVariants.visible) {
      customVariants.visible = {};
    }
    
    if (!customVariants.visible.transition) {
      customVariants.visible.transition = {};
    }
    
    if (delay > 0) {
      customVariants.visible.transition.delay = delay;
    }
    
    if (duration) {
      customVariants.visible.transition.duration = duration;
    }
  }

  // Define hover effect
  const hoverStyles = getHoverEffects(hoverEffect);

  // Combine refs
  const setRefs = useCallback((node) => {
    ref(node);
    elementRef.current = node;
  }, [ref]);

  return (
    <motion.div
      ref={setRefs}
      initial="hidden"
      animate={controls}
      variants={customVariants}
      className={className}
      style={{
        ...style,
        transform: 'translate3d(0,0,0)', // Force GPU layer
        backfaceVisibility: 'hidden',
        perspective: 1000,
      }}
      whileHover={hoverEffect !== 'none' ? hoverStyles : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection; 