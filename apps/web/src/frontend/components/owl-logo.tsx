import { useState } from "react";

export function OwlLogo() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative h-12 w-12 flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src="/owl-logo-open.png"
        alt="Uplight"
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${
          isHovered ? "opacity-0" : "opacity-100"
        }`}
      />
      <img
        src="/owl-logo-closed.png"
        alt="Uplight"
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
