import React, { useState } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import './popupBoxForm.css'

const PopupForm = ({ 
    show, 
    handleClose, 
    title, 
    children, 
    showFooter, 
    footerText, 
    handleAdd, 
    // New props for database update functionality
    handleCustomSubmit, 
    submitButtonText,
    // Existing props
    dialogClassName, 
    dimmed = false 
}) => {
    const [loading, setLoading] = useState(false);

    // 1. Determine the primary action: prioritize handleCustomSubmit (your update logic) over handleAdd (your add round logic)
    const primaryAction = handleCustomSubmit || handleAdd;

    // 2. Determine the button label: use submitButtonText, otherwise default to "ADD +"
    // We modify the label based on which action is being taken.
    const primaryButtonLabel = submitButtonText || (handleAdd ? "ADD +" : "Submit");
    
    // 3. Generalized click handler for the primary button
    const handlePrimaryClick = async () => {
        if (!primaryAction) return;

        setLoading(true);
        try {
            await primaryAction(); // Execute handleRoundCompletionSubmit or addNewRound
            toast.success("Successfully processed!");
        } catch (error) {
            // Include error details for better debugging
            const errorMessage = error?.response?.data?.message || error?.message || "Operation failed. Please try again.";
            toast.error(errorMessage);
            console.error("Operation Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} dialogClassName={`${dialogClassName || ''} ${dimmed ? 'popup-dimmed' : ''}`.trim()} style={{ position: 'fixed',top: '60%',left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999}}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{children}</Modal.Body>

            {showFooter && (
                <Modal.Footer>
                    {/* Primary Action Button (This button now correctly executes your update logic) */}
                    {primaryAction && (
                        <Button variant="primary" onClick={handlePrimaryClick} disabled={loading}>
                            {loading ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> {primaryButtonLabel.replace(/\s?\+?$/, '')}ing...
                                </>
                            ) : (
                                primaryButtonLabel
                            )}
                        </Button>
                    )}
                    
                    {/* Close Button */}
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        {footerText || 'Close'}
                    </Button>
                </Modal.Footer>
            )}
        </Modal>
    );
};

export default PopupForm;