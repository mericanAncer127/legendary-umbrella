// src/components/ImageModal.tsx
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './ImageModal.css';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  altText: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageUrl, altText, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const downloadButtonRef = useRef<HTMLAnchorElement>(null);

  // Close modal on Esc key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Shift focus to close button when modal opens
      closeButtonRef.current?.focus();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Return focus to triggering element when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Optionally, implement focus return logic here
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose} ref={modalRef}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Close Modal"
          ref={closeButtonRef}
        >
          &times;
        </button>
        {/* Download Button */}
        <a
          href={imageUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="modal-download-button"
          aria-label="Download Image"
          ref={downloadButtonRef}
        >
          {/* SVG Download Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            className="download-icon"
            viewBox="0 0 16 16"
          >
            <path d="M.5 9.9V14a.5.5 0 0 0 .5.5h14a.5.5 0 0 0 .5-.5V9.9a.5.5 0 0 0-.146-.354l-7-7a.5.5 0 0 0-.708 0l-7 7A.5.5 0 0 0 .5 9.9zm7 2.3a.5.5 0 0 1 .5.5v3.5H8V12.7a.5.5 0 0 1 .5-.5zm-7-7.3l7-7 7 7H.5z" />
          </svg>
        </a>
        {/* Modal Image */}
        <img src={imageUrl} alt={altText} className="modal-image" />
      </div>
    </div>,
    document.body
  );
};

export default ImageModal;
