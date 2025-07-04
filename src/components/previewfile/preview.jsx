import React, { useEffect, useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { renderAsync } from 'docx-preview';
import './preview.css';

const PreviewModal = ({ show, onHide, preview, fileType }) => {
  const docxContainerRef = useRef(null);

  useEffect(() => {
    const renderDocx = async () => {
      if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
        preview &&
        docxContainerRef.current
      ) {
        try {
          const res = await fetch(preview);
          const arrayBuffer = await res.arrayBuffer();
          docxContainerRef.current.innerHTML = '';
          await renderAsync(arrayBuffer, docxContainerRef.current, null, {
            className: 'docx-preview',
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
          });
        } catch (error) {
          docxContainerRef.current.innerHTML = '<p>Unable to preview Word document.</p>';
        }
      }
    };

    renderDocx();
  }, [preview, fileType, show]);

  if (!fileType) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="custom-modal-header" style={{ backgroundColor: '#2c3e50' }}>
        <Modal.Title style={{ color: '#fff' }}>Preview</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: '80vh', overflowY: 'auto', backgroundColor: '#2c3e50' }}>
        {/* Image Preview */}
        {fileType.startsWith('image/') && (
          <img
            src={preview}
            alt="File Preview"
            style={{
              maxWidth: '100%',
              height: 'auto',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        )}

        {/* PDF Preview */}
        {fileType === 'application/pdf' && (
          <embed src={preview} type="application/pdf" width="100%" height="500px" />
        )}

        {/* Word DOCX Preview */}
        {fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && (
          <div
            ref={docxContainerRef}
            style={{
              padding: '10px',
              minHeight: '400px',
              maxWidth: '100%',
              overflowX: 'auto',
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: '#fff',
              borderRadius: '8px',
            }}
          />
        )}
      </Modal.Body>

      <Modal.Footer style={{ backgroundColor: '#2c3e50' }}>
        <Button variant="danger" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PreviewModal;
