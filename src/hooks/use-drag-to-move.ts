import { useEffect, RefObject } from 'react';

interface UseDragToMoveProps {
  elementRef: RefObject<HTMLElement>;
  isMounted: RefObject<boolean>;
  onPositionChange: (position: { bottom: number }) => void;
}

export const useDragToMove = ({
  elementRef,
  isMounted,
  onPositionChange,
}: UseDragToMoveProps) => {
  useEffect(() => {
    let dragCleanupFunctions: (() => void)[] = [];

    const handleMouseDown = (event: MouseEvent) => {
      if (!elementRef.current || !isMounted.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const initialY = event.clientY;
      const initialBottom = window.innerHeight - rect.bottom;

      const handleMouseMove = (event: MouseEvent) => {
        if (!isMounted.current) return;
        const newBottom = initialBottom - (event.clientY - initialY);
        onPositionChange({ bottom: newBottom });
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        dragCleanupFunctions = dragCleanupFunctions.filter(
          (cleanup) => cleanup !== handleMouseUp
        );
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      dragCleanupFunctions.push(handleMouseUp);
    };

    if (elementRef.current) {
      elementRef.current.addEventListener('mousedown', handleMouseDown);
    }

    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('mousedown', handleMouseDown);
      }
      // Cleanup any remaining drag operations
      dragCleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [elementRef, isMounted, onPositionChange]);
};
