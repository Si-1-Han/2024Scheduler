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
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  )

  const [events, setEvents] = useState({}); // 날짜별 일정 저장
  
  const [selectedEvent, setSelectedEvent] = useState([]);
  // 모달 열기
  const openModal = (date) => {
    const event = events[date] || [];
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
    setEvents((prevEvents) => {
      const updatedEvents = { ...prevEvents };
      const dateEvents = updatedEvents[selectedDate] || []; 
      updatedEvents[selectedDate] = [...dateEvents, eventData];
      return updatedEvents;
    });
    setSelectedEvent((prevSelected) => [...prevSelected, eventData]); // selectedEvent 업데이트
  };
  const onDeleteEvent = (eventToDelete) => {
    setEvents((prevEvents) => {
      const updatedEvents = { ...prevEvents };
  
      // 해당 날짜의 이벤트 배열에서 특정 이벤트를 제외
      updatedEvents[selectedDate] = updatedEvents[selectedDate].filter(
        (event) => event !== eventToDelete
      );
  
      // 만약 해당 날짜에 더 이상 이벤트가 없으면 해당 날짜를 삭제
      if (updatedEvents[selectedDate].length === 0) {
        delete updatedEvents[selectedDate];
      }
  
      return updatedEvents;
    });
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
          onOpen={openModal}
          onClose={closeModal}
          onAddEvent={addEvent}
          onDeleteEvent={onDeleteEvent}
          today = {today} 
          selectedDate={selectedDate}
          events = { selectedEvent }
          dates = {dates}
          />
      )}
    </div>
  );
}

export default App;
