import React from "react";

export const Loading = () => {
  return (
    <div className="flex ml-[8px]">
      <div className="w-[4px] h-[4px] bg-black rounded-full mx-[1px] dot"></div>
      <div className="w-[4px] h-[4px] bg-black rounded-full mx-[1px] dot"></div>
      <div className="w-[4px] h-[4px] bg-black rounded-full mx-[1px] dot"></div>
    </div>
  );
};
