import { useState, useMemo } from "react";

export const useCalendar = (opportunities) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month padding
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        date: new Date(year, month, -startingDayOfWeek + i + 1),
        isCurrentMonth: false,
        opportunities: [],
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      
      const dayOpportunities = opportunities.filter(
        (opp) => opp.date === dateStr
      );
      
      days.push({
        date,
        isCurrentMonth: true,
        opportunities: dayOpportunities,
      });
    }
    
    // Next month padding to fill grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        opportunities: [],
      });
    }
    
    return days;
  }, [currentDate, opportunities]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthYearLabel = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return {
    currentDate,
    setCurrentDate,
    calendarDays,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    monthYearLabel,
  };
};

export default useCalendar;
