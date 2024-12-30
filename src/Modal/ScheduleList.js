import React, { useState, useEffect } from "react";
import AddScheduleModal from "./AddScheduleModal";
import "./ScheduleList.css";
import { LocalStorageManager } from "../tool";

const Modal = ({ isOpen, onClose, selectedDate }) => {
  const [schedules, setSchedules] = useState([]);
  const [isAddModalOpen, AddModalOpen] = useState(false);

  useEffect(() => {
    const loadSchedule = LocalStorageManager.load("schedules") || [];
    setSchedules(loadSchedule);
  }, []);

  const handleAddScheduleClick = () => {
    AddModalOpen(true);
  };

  const SaveSchedule = (newSchedule) => {
    const updatedSchedules = [...schedules, newSchedule];
    setSchedules(updatedSchedules);
    LocalStorageManager.save("schedules", updatedSchedules);
    AddModalOpen(false);
  };

  const handleRemoveSchedule = (id) => {
    const updatedSchedules = schedules.filter((schedule) => schedule.id !== id);
    setSchedules(updatedSchedules);
    LocalStorageManager.save("schedules", updatedSchedules);
  };

  if (!isOpen) return null;

  return (
    <div className={`modal schedule ${isOpen ? "show" : ""}`}>
      <div className="modal-bg" onClick={onClose}>
        <div className="modal-form" onClick={(e) => e.stopPropagation()}>
          <div className="modal-top flex aifs jcsb">
            <h1 className="modal-title">
              {selectedDate
                ? `${selectedDate.year}년 ${selectedDate.month}월 ${selectedDate.day}일의 일정`
                : "날짜를 선택하세요"}
            </h1>
            <button onClick={onClose}>x</button>
          </div>

          <div className="modal schedyke">
            <div className="schedule-list col-flex">
              {schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <div key={schedule.id} className="schedule-item">
                    <img src={schedule.image} alt={schedule.title || "이미지 없음"} />
                    <div className="schedule-content">
                      <h3>{schedule.title}</h3>
                      <p>{schedule.description}</p>
                      <p>
                        {schedule.startTime} ~ {schedule.endTime}
                      </p>
                    </div>
                    <div className="schedule-actions">
                      <button
                        className="delete-btn"
                        onClick={() => handleRemoveSchedule(schedule.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="flex aic jcc"
                  style={{ width: "100%", height: "100%" }}
                >
                  일정 없음!
                </div>
              )}
            </div>

            {/* 일정 추가 버튼 */}
            <div className="form-inf">
              <button onClick={handleAddScheduleClick}>일정 추가...</button>
            </div>
          </div>
        </div>
      </div>

      {/* AddScheduleModal */}
      {isAddModalOpen && (
        <AddScheduleModal
          isOpen={isAddModalOpen}
          onClose={() => AddModalOpen(false)}
          onSave={SaveSchedule}
        />
      )}
    </div>
  );
};

export default Modal;
