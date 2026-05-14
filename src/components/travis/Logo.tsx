import * as React from "react";
import { cn } from "@/lib/utils";

type LogoProps = React.HTMLAttributes<HTMLSpanElement> & {
  size?: number;
};

export function Logo({ size = 17, className, style, ...rest }: LogoProps) {
  return (
    <span
      {...rest}
      className={cn("font-travis text-travis-ink", className)}
      style={{
        fontSize: size,
        fontWeight: 500,
        letterSpacing: "-0.015em",
        lineHeight: 1,
        ...style,
      }}
    >
      Travis
    </span>
  );
}
