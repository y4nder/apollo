"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

interface Props {
  to: number;
  duration?: number;
  format?: (n: number) => string;
}

export function Counter({ to, duration = 1.2, format }: Props) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? to : 0);
  const displayed = useTransform(mv, (v) =>
    format ? format(v) : String(Math.round(v))
  );

  useEffect(() => {
    if (reduce) {
      mv.set(to);
      return;
    }
    const controls = animate(mv, to, { duration, ease: "easeOut" });
    return () => controls.stop();
  }, [to, reduce, duration, mv]);

  return <motion.span>{displayed}</motion.span>;
}
