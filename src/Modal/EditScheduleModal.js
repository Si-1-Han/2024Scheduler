import React, { useState } from "react";
import "./AddScheduleModal.css";

const EditScheduleModal = ({ isOpen, onClose, schedule, onSave }) => {
  const [title, setTitle] = useState(schedule?.title || "");
  const [description, setDescription] = useState(schedule?.description || "");
  const [startDate, setStartDate] = useState(schedule?.startDate || "");
  const [endDate, setEndDate] = useState(schedule?.endDate || "");
  const [startTime, setStartTime] = useState(schedule?.startTime || "");
  const [endTime, setEndTime] = useState(schedule?.endTime || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedSchedule = {
      ...schedule,
      title,
      description,
      startDate,
      endDate: endDate || startDate,
      startTime: startTime || "00:00",
      endTime: endTime || "00:00",
    };
    onSave(updatedSchedule); // 부모 컴포넌트로 업데이트 데이터 전달
    onClose(); // 모달 닫기
  };

  if (!isOpen) return null; // 모달이 닫혀 있으면 렌더링하지 않음

  return (
    <div className="modal edit-schedule show">
      <div className="modal-bg" onClick={onClose}>
        <div className="modal-form" onClick={(e) => e.stopPropagation()}>
          <div className="modal-top flex aifs jcsb">
            <h1 className="modal-title">일정 수정</h1>
            <button onClick={onClose}>x</button>
          </div>

          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="일정 제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="일정 설명"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
              <div className="form-inf">
                <button type="submit">저장</button>
                <button type="button" onClick={onClose}>
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditScheduleModal;
