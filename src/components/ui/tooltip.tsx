import React, { useState } from "react";

interface TooltipProps {
  children: React.ReactNode;
  label: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, label }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseOver = () => {
    setShowTooltip(true);
  };

  const handleMouseOut = () => {
    setShowTooltip(false);
  };

  return (
    <div
      className="relative"
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      {children}
      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-zinc-700 text-white text-xs rounded whitespace-nowrap"
          style={{ top: "100%", left: "50%", transform: "translateX(-50%)" }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
