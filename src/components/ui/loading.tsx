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


export const LoadingIndicator= ({message}: {message?: string}) => (
  <div className="bg-white text-black p-[8px] rounded-md text-center mb-[8px] animate-[fadeIn]">
    <div className="flex items-center justify-center text-[14px]">
      {message && <span>{message}</span>}
      <Loading />
    </div>
  </div>
);