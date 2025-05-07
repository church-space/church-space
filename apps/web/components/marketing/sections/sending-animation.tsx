"use client";

import React, { forwardRef, useRef } from "react";

import { cn } from "@church-space/ui/cn";
import { AnimatedBeam } from "@church-space/ui/animated-beam";
import { ChurchSpaceBlack, CircleUser } from "@church-space/ui/icons";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-10 items-center justify-center rounded-full border-2 bg-white p-0 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export function AnimatedBeamDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative flex h-[170px] w-full items-center justify-center p-0 px-6"
      ref={containerRef}
    >
      <div className="flex size-full max-h-[160px] max-w-md flex-col items-stretch justify-between gap-5">
        <div className="flex flex-row items-center justify-end">
          <Circle ref={div1Ref}>
            <CircleUser height={"22"} width={"22"} />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div4Ref} className="size-14 -translate-y-2">
            <ChurchSpaceBlack height={"27"} width={"27"} />
          </Circle>
          <Circle ref={div6Ref}>
            <CircleUser height={"22"} width={"22"} />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-end">
          <Circle ref={div7Ref}>
            <CircleUser height={"22"} width={"22"} />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-9}
      />

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div4Ref}
        reverse
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div7Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={9}
        reverse
      />
    </div>
  );
}
