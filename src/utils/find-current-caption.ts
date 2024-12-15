import { CaptionsTokenized } from "../types";

export const findCurrentCaption = (
    captions: CaptionsTokenized[],
    currentTime: number
  )  => {
    try{
    let left = 0;
    let right = captions.length - 1;
  
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const caption = captions[mid];
      const neighbor = mid + 1 ? captions[mid + 1] : null;
  
      if (
        currentTime >= caption.start &&
        currentTime <= caption.end &&
        neighbor && neighbor.start > currentTime
      ) {
        return caption;
      } else if (currentTime < caption.start) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
  
    return null; // No matching caption found
    } catch{
      return null;
    }
  };
  