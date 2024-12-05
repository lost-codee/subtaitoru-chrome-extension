import { YoutubeCaptionsTokenize } from "../types";

export const findCurrentCaption = (
    captions: YoutubeCaptionsTokenize[],
    currentTime: number
  )  => {
    let left = 0;
    let right = captions.length - 1;
  
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const caption = captions[mid];
      const neighbor = mid + 1 ? captions[mid + 1] : null;
  
      if (
        currentTime >= caption.start &&
        currentTime <= caption.end &&
        neighbor!.start > currentTime
      ) {
        return caption;
      } else if (currentTime < caption.start) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
  
    return null; // No matching caption found
  };
  