"use client";
import { useEffect, useState } from "react";
import s from "./main.module.css";

// The rotating word sits under the gold "highlighter" mark (the signature move from DESIGN.md).
export function RotatingCategory({ CATEGORY_WORDS }: { CATEGORY_WORDS: Array<string> }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % CATEGORY_WORDS.length);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={s.highlight}>
      <span className="sr-only">{CATEGORY_WORDS.join(", ")}</span>
      <span aria-hidden key={index} className={`${s.animateSlideUp} inline-block`}>
        {CATEGORY_WORDS[index]}
      </span>
    </span>
  );
}
