"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function HeroSubtitle() {
  const phrases = [
    "beautiful emails.",
    "organized links.",
    "powerful automations.",
  ];

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-sm items-center text-pretty pt-0 text-center text-xl font-semibold text-secondary-foreground sm:pt-2 sm:text-2xl md:text-3xl lg:items-start lg:pt-0 lg:text-left">
      Engage your people with{" "}
      <div className="inline-block min-w-[200px] text-primary">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhraseIndex}
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.3 }}
          >
            {phrases[currentPhraseIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
