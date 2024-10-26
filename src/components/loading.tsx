import React from "react";

export const Loading = () => {
  return (
    <div className="flex ml-2">
      <div className="w-1 h-1 bg-black rounded-full mx-[1px] dot"></div>
      <div className="w-1 h-1 bg-black rounded-full mx-[1px] dot"></div>
      <div className="w-1 h-1 bg-black rounded-full mx-[1px] dot"></div>
    </div>
  );
};
