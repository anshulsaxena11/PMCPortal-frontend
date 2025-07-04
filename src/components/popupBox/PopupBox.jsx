import React, { useState } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';

const Popup = ({ show, handleClose, title, children, showFooter, footerText, handleAdd }) => {
  const [loading, setLoading] = useState(false);

  // Handle add button click, call provided function, handle loading state and error/success
  const handleAddClick = async () => {
    setLoading(true);
    try {
      await handleAdd(); // Call the provided handleAdd function
      toast.success("Successfully added!");
    } catch (error) {
      toast.error("Failed to add. Please try again.");
      console.error("Add Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>

      {showFooter && (
        <Modal.Footer>
          <Button variant="primary" onClick={handleAddClick} disabled={loading}>
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Adding...
              </>
            ) : (
              "ADD +"
            )}
          </Button>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            {footerText || 'Close'}
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default Popup;
