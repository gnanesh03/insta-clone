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
        class="popup"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h2 class="message">{message}</h2>
        {children}

        <button
          class="close-button"
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
