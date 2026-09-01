'use client';
import { useEffect, useState } from 'react';
import s from './main.module.css';

export function RotatingCategory({ CATEGORY_WORDS }: { CATEGORY_WORDS: Array<string> }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % CATEGORY_WORDS.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-block overflow-hidden">
      <span
        key={index}
        className={`${s.animateSlideUp} inline-block text-primary`}
        style={{ transformOrigin: '50% 100%' }}
      >
        {CATEGORY_WORDS[index]}
      </span>
    </span>
  );
}
