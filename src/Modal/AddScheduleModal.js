import React, { useState } from "react";
import "./AddScheduleModal.css";

const AddScheduleModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [image, setImage] = useState(null);

  const handleSave = () => {
    const newSchedule = {
      id: `${Date.now()}`,
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      image: image ? URL.createObjectURL(image) : null,
    };
    onSave(newSchedule);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal add-schedule show">
      <div className="modal-bg" onClick={onClose}></div>
      <div className="modal-form">
        <div className="modal-header">
          <h1>일정 추가</h1>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <hr />
        <form>
          <label>제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
          />
          <label>일정 내용</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="일정 내용을 입력하세요"
          />
          <label>시작 날짜</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label>일정 시작</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <label>종료 날짜</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <label>일정 종료</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          <label>이미지 업로드</label>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <div className="modal-actions">
            <button type="button" className="save-btn" onClick={handleSave}>
              일정 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddScheduleModal;
