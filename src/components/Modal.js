import React, { useState } from 'react';
import './Modal.css';

const Modal = ({ onClose, onAddEvent, today, selectedDate, events}) => {
  const [onEdit, setOnEdit] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const content = e.target.content.value;
    const image = e.target.image.files[0];
    const eventData = { title, content, image };

    onAddEvent(eventData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <button onClick={onClose} className="modal-close">X</button>
          <h2>{today.getFullYear()}. {today.getMonth() + 1}. {selectedDate}</h2>
        </div>
        <div className="modal-body">
          {onEdit === true ? 
          <div>
            <button onClick={() => setOnEdit(false)} className='button sidebutton'>뒤로</button>
            <form onSubmit={handleSubmit}>
              <input type="text" name="title" placeholder="제목" required /><p/>
              <textarea name="content" placeholder="내용" required></textarea><p/>
              <input type="file" name="image" accept="image/*" /><p/>
              <button type="submit" className='button'>일정 추가</button>
            </form>
          </div> :
          <div>
            <h1 className='textbox'>제목: {events.title || ""}</h1>
            <p className='textbox'>내용: {events.content || ""}</p>
            {events.image && (
              <img 
                src={URL.createObjectURL(events.image)}
                alt="event-thumbnail" 
                className='modal-image'
                />
            )}<p/>
            <button onClick={() => setOnEdit(true)} className='button sidebutton'>수정</button>
          </div>
          } 
        </div>
      </div>
    </div>
  );
};

export default Modal;
