"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setHidden(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 z-50 px-6 sm:px-10 pt-6"
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? "translateY(-30px)" : "translateY(0)",
        pointerEvents: hidden ? "none" : "auto",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      <a href="#" className="flex items-center gap-3 group">
        <Image
          src="/logo"
          alt="layer3studio"
          width={38}
          height={38}
          className="transition-transform duration-300 group-hover:scale-110"
          priority
        />
        <span
          className="text-white/80 font-semibold tracking-tight text-lg group-hover:text-white transition-colors duration-300"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          layer3studio
        </span>
      </a>
    </div>
  );
}