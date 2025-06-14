import React from "react";
import { cn } from "../../utils/cn";

export const PulsatingButton = React.forwardRef(
  (
    {
      className,
      children,
      pulseColor = "#5FB584",
      duration = "1.5s",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative flex cursor-pointer items-center justify-center rounded-lg bg-primary px-4 py-2 text-center text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95",
          "before:absolute before:inset-0 before:rounded-lg before:animate-pulse before:bg-current before:opacity-20",
          className,
        )}
        style={{
          "--pulse-color": pulseColor,
          "--duration": duration,
          background: `linear-gradient(135deg, ${pulseColor} 0%, ${pulseColor}dd 100%)`,
        }}
        {...props}
      >
        <div className="relative z-10">{children}</div>
        <div 
          className="absolute left-1/2 top-1/2 size-full -translate-x-1/2 -translate-y-1/2 rounded-lg animate-ping opacity-20"
          style={{
            background: pulseColor,
            animationDuration: duration,
          }}
        />
      </button>
    );
  },
);

PulsatingButton.displayName = "PulsatingButton"; 