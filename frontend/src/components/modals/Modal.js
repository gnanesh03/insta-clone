import React from "react";
import "./Modal.css";
const Modal = ({ children, message, setIsModalOpen, otherFunction }) => {
  return (
    <div
      id="modal-background"
      onClick={() => {
        setIsModalOpen(false);
      }}
    >
      <div
        className="popup"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h2 className="message">{message}</h2>
        {children}

        <button
          className="close-button"
          onClick={() => {
            setIsModalOpen(false);
          }}
        >
          X
        </button>
      </div>
    </div>
  );
};

export default Modal;
