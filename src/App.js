import React, { useState } from "react";
import Calendar from "./Calendar/Calendar";
import Modal from "./Modal/ScheduleList";
import {
  generateDateRange,
  getColorForSchedule,
  generateHash,
  LocalStorageManager,
  sortSchedules,
} from "./tool.js";
import "./style.css";

const App = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [schedules, setSchedules] = useState([]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddSchedule = (newSchedule) => {
    setSchedules([...schedules, newSchedule]);
  };

  const toggleComplete = (id) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === id
          ? { ...schedule, completed: !schedule.completed }
          : schedule
      )
    );
  };

  const remove= (id) => {
    setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
  };

  const getSchedulesForDate = (date) => {
    return schedules.filter((schedule) => {
      const dateRange = generateDateRange(
        schedule.startDate,
        schedule.endDate
      ).map((d) => d.toISOString().split("T")[0]);
      return dateRange.includes(date);
    });
  };

  return (
    <div>
      <Calendar onDateClick={handleDateClick} />
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          selectedDate={selectedDate}
          schedules={getSchedulesForDate(selectedDate)}
          onAddSchedule={handleAddSchedule}
          onToggleComplete={toggleComplete}
          onRemoveSchedule={remove}
        />
      )}
    </div>
  );
};


export default App;
