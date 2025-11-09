import React from "react";

interface BigBananaProps {
  className?: string;
}

// Displays the banana PNG from public assets instead of an inline SVG.
const BigBanana = ({ className = "" }: BigBananaProps) => {
  return (
    <div className={`big-banana ${className}`} aria-hidden>
      <img src="/nanna.png" alt="Agent banana" className="banana-img" />
    </div>
  );
};

export default BigBanana;
