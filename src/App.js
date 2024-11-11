import React, { useState } from 'react';
import './App.css';
import Daytop from './components/Daytop';
import CalendarDate from './components/CalendarDate';
import Modal from './components/Modal';

function App() {
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THR', 'FRI', 'SAT'];
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const dates = 
    Array.from({ length: firstDayOfMonth }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1))

  const [events, setEvents] = useState({
    title: "",
    content: "",
    image: ""
  }); // 날짜별 일정 저장
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  // 모달 열기
  const openModal = (date) => {
    const event = events[date] || { title: "", context: "", image: ""};
    setSelectedDate(date)
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  // 일정 추가
  const addEvent = (eventData) => {
    setEvents(prevEvents => {
      const updatedEvents = { ...prevEvents };
      updatedEvents[selectedDate] = eventData; // 선택된 날짜에 이벤트 추가
      return updatedEvents;
    });
    closeModal();
  };

  return (
    <div className="wrap flex jcc aic">
      <div className="calendar">
        <h1 className="calendar-header">
          {today.getFullYear()}. {today.getMonth() + 1}
        </h1>
        <div className="day-top">
          {daysOfWeek.map((day, index) => (
            <Daytop key={index} name={day} />
          ))}
        </div>
        <CalendarDate 
          events={events} 
          onDateClick={openModal} 
          dates = {dates}
        />
      </div>

      {isModalOpen && (
        <Modal 
          onClose={closeModal}
          onAddEvent={addEvent}
          today = {today} 
          selectedDate={selectedDate}
          events = { selectedEvent }
          dates = {dates}/>
      )}
    </div>
  );
}

export default App;
