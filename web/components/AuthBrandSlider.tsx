"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { MotionBox } from "@/components/motion";

const images = ["/hero-image2.png", "/landing-hero.png"];

export default function AuthBrandSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <AnimatePresence>
      <MotionBox
        key={images[index]}
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${images[index]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </AnimatePresence>
  );
}
