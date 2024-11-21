import React from 'react';
import './CalendarDate.css';

const CalendarDate = ({ events, onDateClick, dates }) => {
  return (
    <div className="date-grid">
      {dates.map((date, index) => (
        <div
          key={index}
          className={`date-cell ${date ? "" : "empty-cell"}`}
          onClick={() => date && onDateClick(date)} // 날짜 셀 클릭 시 모달 열기
        >
          <p style={{textAlign: 'left'}}>{date || ""} </p>
          {/* 해당 날짜에 일정이 있으면 섬네일 이미지 표시 */}
          {events[date] && events[date].image && (
            <img
              src={URL.createObjectURL(events[date].image)}
              alt="event-thumbnail"
              className="event-thumbnail"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default CalendarDate;
