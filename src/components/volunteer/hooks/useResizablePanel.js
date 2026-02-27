import { useState, useCallback, useEffect } from "react";

export const useResizablePanel = (storageKey = "adminCalendarSplit", defaultSplit = 50) => {
  const [calendarSplit, setCalendarSplit] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? parseInt(saved, 10) : defaultSplit;
  });
  
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleDragMove = useCallback(
    (e) => {
      if (!isDragging) return;

      const container = document.getElementById("admin-main-content");
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const percentage = Math.max(20, Math.min(80, (y / rect.height) * 100));

      setCalendarSplit(percentage);
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      localStorage.setItem(storageKey, calendarSplit.toString());
    }
  }, [isDragging, calendarSplit, storageKey]);

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => handleDragMove(e);
    const handleMouseUp = () => handleDragEnd();

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  return {
    calendarSplit,
    isDragging,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
};

export default useResizablePanel;
