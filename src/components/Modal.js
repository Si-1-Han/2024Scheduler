import React, { useState } from "react";
import "./Modal.css";
import ModalList from "./ModalList";

const Modal = ({
  onClose,
  onOpen,
  onAddEvent,
  today,
  selectedDate,
  events,
  onDeleteEvent,
}) => {
  const [onEdit, setOnEdit] = useState(false);
  const [editedEvent, setEditedEvent] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const content = e.target.content.value;
    const image = e.target.image.files[0];
    const eventData = { title, content, image };

    onAddEvent(eventData);
    setOnEdit(false);
  };

  const handleEdit = (event) => {
    setEditedEvent(event);
    setOnEdit(true);
  };

  const handleDelete = (event) => {
    onDeleteEvent(event);
    onOpen(selectedDate);
  };

  const hours = Array.from({length: 25}, (v, i) => i)
  const mins = Array.from({length: 61}, (v, i) => i)

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <button onClick={onClose} className="modal-close">
            X
          </button>
          <h2>
            {today.getFullYear()}. {today.getMonth() + 1}. {selectedDate}
          </h2>
        </div>
        <div className="modal-body">
          {onEdit ? (
            <div>
              {/* "뒤로" 버튼 */}
              <button
                onClick={() => setOnEdit(false)}
                className="button sidebutton"
              >
                뒤로
              </button>
              {/* 수정 폼 */}
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="title"
                  placeholder="제목"
                  defaultValue={editedEvent ? editedEvent.title : ""}
                  required
                />
                <p />
                <textarea
                  name="content"
                  placeholder="내용"
                  defaultValue={editedEvent ? editedEvent.content : ""}
                  required
                ></textarea>
                <p />
                <input type="file" name="image" accept="image/*" />
                <p />
                <div>
                  <select name="hour">
                    {hours.map(index => (
                      <option value={index}>{index}</option>
                    ))
                  }
                  </select>
                  <select name="hour">
                    {mins.map(index => (
                      <option value={index}>{index}</option>
                    ))
                  }
                  </select>
                </div>
                <button type="submit" className="button">
                  수정 완료
                </button>
              </form>
            </div>
          ) : (
            <div>
              {/* 여러 이벤트가 있을 경우 */}
              {Array.isArray(events) &&
                events.length > 0 &&
                events.map((event, index) => (
                  <ModalList
                    key={event.id || index}
                    event={event}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              {/* "일정 추가" 버튼 */}
              <button
                onClick={() => handleEdit()}
                className="button sidebutton"
              >
                일정 추가
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
