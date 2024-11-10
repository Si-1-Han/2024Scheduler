import React, { useState } from 'react';
import './App.css';
import Daytop from './components/Daytop';
import CalendarDate from './components/CalendarDate';
import Modal from './components/Modal';

function App() {
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THR', 'FRI', 'SAT'];
  const today = new Date();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState({}); // 날짜별 일정 저장

  // 모달 열기
  const openModal = (date) => {
    setSelectedDate(date);
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
          year={today.getFullYear()} 
          month={today.getMonth()} 
          events={events} 
          onDateClick={openModal} 
        />
      </div>

      {isModalOpen && (
        <Modal onClose={closeModal}>
          <h2>{today.getFullYear()}. {today.getMonth() + 1}. {selectedDate}</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const title = e.target.title.value;
            const content = e.target.content.value;
            const image = e.target.image.files[0];
            const eventData = { title, content, image };
            addEvent(eventData);
          }}>
            <input type="text" name="title" placeholder="제목" required /><p/>
            <textarea name="content" placeholder="내용" required></textarea><p/>
            <input type="file" name="image" accept="image/*" /><p/>
            <button type="submit" className='button'>일정 추가</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default App;
