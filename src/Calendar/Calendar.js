import React, { useState, useEffect } from "react";
import "./Calendar.css";

const Calendar = ({ onDateClick }) => {
  // 현재 날짜를 기반으로 초기값 설정
  const today = new Date();
  const [currentDate, setCurrentDate] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1, // 0부터 시작하므로 +1 필요
  });
  const [dates, setDates] = useState([]);

  // 월 이동 함수
  const addMonth = (increment) => {
    const newDate = new Date(currentDate.year, currentDate.month - 1 + increment, 1);
    setCurrentDate({
      year: newDate.getFullYear(),
      month: newDate.getMonth() + 1,
    });
  };

  // 현재 월의 날짜 계산
  const calculateDates = (year, month) => {
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    const lastDateOfMonth = new Date(year, month, 0).getDate();

    const datesArray = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      datesArray.push(null); // 이전 월의 빈 칸
    }
    for (let i = 1; i <= lastDateOfMonth; i++) {
      datesArray.push(i);
    }
    setDates(datesArray);
  };

  useEffect(() => {
    calculateDates(currentDate.year, currentDate.month);
  }, [currentDate]);

  return (
    <div className="wrap col-flex jcc alc">
      <div className="flex aic" style={{ gap: "40px" }}>
        <button onClick={() => addMonth(-1)}>◀</button>
        <h1 className="cur-date">
          {currentDate.year}. {currentDate.month}
        </h1>
        <button onClick={() => addMonth(1)}>▶</button>
      </div>

      <div className="calendar">
        {/* 요일 헤더 */}
        {["SUN", "MON", "TUE", "WED", "THR", "FRI", "SAT"].map((day) => (
          <div key={day} className="calendar-top">
            {day}
          </div>
        ))}

        {/* 날짜 */}
        {dates.map((day, index) => (
          <div
            key={index}
            className={`date ${day ? "" : "hidden-date"}`}
            onClick={() =>
              day && onDateClick({ year: currentDate.year, month: currentDate.month, day })
            }
          >
            {day && <p>{day}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
