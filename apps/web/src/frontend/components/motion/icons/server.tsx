"use client";

import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { motion, useAnimation } from "motion/react";
import { cn } from "@/lib/utils";

export interface ServerIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ServerIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const ServerIcon = forwardRef<ServerIconHandle, ServerIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlledRef.current) {
          controls.start("animate");
        } else {
          onMouseEnter?.(e);
        }
      },
      [controls, onMouseEnter],
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlledRef.current) {
          controls.start("normal");
        } else {
          onMouseLeave?.(e);
        }
      },
      [controls, onMouseLeave],
    );

    return (
      <div
        className={cn(className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.rect
            width="20"
            height="8"
            x="2"
            y="2"
            rx="2"
            ry="2"
            variants={{
              normal: { y: 0 },
              animate: { y: [0, -0.6, 0] },
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            animate={controls}
            initial="normal"
          />
          <motion.rect
            width="20"
            height="8"
            x="2"
            y="14"
            rx="2"
            ry="2"
            variants={{
              normal: { y: 0 },
              animate: { y: [0, 0.6, 0] },
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            animate={controls}
            initial="normal"
          />
          <motion.line
            x1="6"
            x2="6.01"
            y1="6"
            y2="6"
            variants={{
              normal: { opacity: 1 },
              animate: { opacity: [1, 0.35, 1] },
            }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            animate={controls}
            initial="normal"
          />
          <motion.line
            x1="6"
            x2="6.01"
            y1="18"
            y2="18"
            variants={{
              normal: { opacity: 1 },
              animate: { opacity: [1, 0.35, 1] },
            }}
            transition={{ duration: 0.22, ease: "easeOut", delay: 0.06 }}
            animate={controls}
            initial="normal"
          />
        </svg>
      </div>
    );
  },
);

ServerIcon.displayName = "ServerIcon";

export { ServerIcon };
