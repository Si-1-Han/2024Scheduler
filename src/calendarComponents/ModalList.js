import React from 'react';
import './ModalList.css';

function ModalList({ event, onEdit, onDelete }) {
  console.log(event)
  return (
    <div className="modal-list-item">
      <div className="modal-text">
        <h1 className="textbox">{event.title}</h1>
        <p className="textbox">{event.content}</p>
      </div>
      {event.image && (
        <div className="modal-image-container">
          <img
            src={URL.createObjectURL(event.image)}
            alt="event-thumbnail"
            className="modal-image"
          />
        </div>
      )}
      <div className="modal-actions">
        <button onClick={() => onEdit(event)} className="modal-action-button">수정</button>
        <button onClick={() => onDelete(event)} className="modal-action-button">삭제</button>
      </div>
    </div>
  );
}

export default ModalList;
