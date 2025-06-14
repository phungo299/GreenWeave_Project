"use client";

import { cn } from "../../utils/cn";
import React, { useEffect, useState } from "react";

export const RippleButton = React.forwardRef(
  (
    {
      className,
      children,
      rippleColor = "#ffffff",
      duration = "600ms",
      onClick,
      ...props
    },
    ref,
  ) => {
    const [buttonRipples, setButtonRipples] = useState([]);

    const handleClick = (event) => {
      createRipple(event);
      onClick?.(event);
    };

    const createRipple = (event) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const newRipple = { x, y, size, key: Date.now() };
      setButtonRipples((prevRipples) => [...prevRipples, newRipple]);
    };

    useEffect(() => {
      if (buttonRipples.length > 0) {
        const lastRipple = buttonRipples[buttonRipples.length - 1];
        const timeout = setTimeout(() => {
          setButtonRipples((prevRipples) =>
            prevRipples.filter((ripple) => ripple.key !== lastRipple.key),
          );
        }, parseInt(duration));
        return () => clearTimeout(timeout);
      }
    }, [buttonRipples, duration]);

    return (
      <button
        className={cn(
          "relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-[#5FB584] bg-transparent px-6 py-3 text-center text-[#5FB584] font-semibold transition-all duration-300 hover:bg-[#5FB584] hover:text-white active:scale-95",
          className,
        )}
        onClick={handleClick}
        ref={ref}
        {...props}
      >
        <div className="relative z-10">{children}</div>
        <span className="pointer-events-none absolute inset-0">
          {buttonRipples.map((ripple) => (
            <span
              className="absolute rounded-full opacity-30"
              key={ripple.key}
              style={{
                width: `${ripple.size}px`,
                height: `${ripple.size}px`,
                top: `${ripple.y}px`,
                left: `${ripple.x}px`,
                backgroundColor: rippleColor,
                transform: `scale(0)`,
                animation: `ripple ${duration} ease-out forwards`,
              }}
            />
          ))}
        </span>
      </button>
    );
  },
);

RippleButton.displayName = "RippleButton"; 