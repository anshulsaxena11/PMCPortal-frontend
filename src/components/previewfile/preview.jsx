import React, { useEffect, useRef, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { renderAsync } from "docx-preview";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import './preview.css'

const PreviewModal = ({ show, onHide, preview, fileType }) => {
  const docxContainerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [docxError, setDocxError] = useState(false);

  useEffect(() => {
    if (!preview || !fileType) return;
    setImageError(false);
    setDocxError(false); 

    let startTime = Date.now();
    let fakeTimer;

    const startLoading = () => {
      setLoading(true);
      setProgress(0);

      // Fake smooth progress for min 5s
      fakeTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const minProgress = Math.min((elapsed / 5000) * 100, 100);
        setProgress((p) => (p < minProgress ? minProgress : p));
      }, 100);
    };

    const finishLoading = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 3000 - elapsed);

      setTimeout(() => {
        setProgress(100);
        setTimeout(() => setLoading(false), 300); // smooth finish
        clearInterval(fakeTimer);
      }, remaining);
    };

    const loadFile = async () => {
      startLoading();

      if (
        fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open("GET", preview, true);
          xhr.responseType = "arraybuffer";

          xhr.onload = async () => {
            if (xhr.status === 200) {
              if (docxContainerRef.current) {
                docxContainerRef.current.innerHTML = "";
                await renderAsync(xhr.response, docxContainerRef.current, null, {
                  className: "docx-preview",
                  inWrapper: true,
                  ignoreWidth: false,
                  ignoreHeight: false,
                });
              }
            } else {
              if (docxContainerRef.current) {
                docxContainerRef.current.innerHTML =
                  '<p style="color:red">No data found.</p>';
              }
              setDocxError(true);
            }
            finishLoading();
          };

          xhr.onerror = () => {
            if (docxContainerRef.current) {
              docxContainerRef.current.innerHTML =
                '<p style="color:red">No data found.</p>';
            }
            setDocxError(true);
            finishLoading();
          };

          xhr.send();
        } catch (error) {
          if (docxContainerRef.current) {
            docxContainerRef.current.innerHTML =
              '<p style="color:red">No data found.</p>';
          }
          setDocxError(true);
          finishLoading();
        }
      } else {
        // For image & PDF we don’t need xhr, just wait min 5s
        finishLoading();
      }
    };

    loadFile();

    return () => clearInterval(fakeTimer);
  }, [preview, fileType, show]);

  if (!fileType) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      fullscreen
      centered
      style={{ zIndex: 2000 }}
    >
      <Modal.Header
        closeButton
        className="custom-modal-header"
        style={{ backgroundColor: "#2c3e50" }}
      >
        <Modal.Title style={{ color: "#fff" }}>Preview</Modal.Title>
      </Modal.Header>

      <Modal.Body
        style={{
          height: "calc(100vh - 120px)",
          backgroundColor: "#000000ff",
          display: "flex",
          flexDirection: "column", 
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden", 
        }}
      >
       
        {/* Centered Loader */}
        {loading && (
          <Box
            sx={{
              width: 300,
              textAlign: "center",
              color: "#fff",
              margin: "auto", 
            }}
          >
            <Typography variant="body2" sx={{ mb: 1, color: "#fff" }}>
              Loading document...
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 5,
                    backgroundColor: "#444",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#00bcd4",
                    },
                  }}
                />
              </Box>
              <Box sx={{ minWidth: 35, ml: 1 }}>
                <Typography variant="body2" sx={{ color: "#fff" }}>
                  {`${Math.round(progress)}%`}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
         {!preview || !fileType ? (
          <Typography variant="h6" sx={{ color: "#f00505ff" }}>
            No data available to preview.
            </Typography>
        ): (
          <>
        {/* Image Preview */}
        {!loading && fileType.startsWith("image/") && (
          imageError ? (
            <Box
              sx={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 1,
              }}
            >
            <ErrorOutlineIcon sx={{ fontSize: 48, color: "red" }} />
            <Typography variant="body1" sx={{ color: "red" }}>
              No data found.
            </Typography>
          </Box>
          ) : (
            <img
              src={preview}
              alt="File Preview"
              onError={() => setImageError(true)}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
          )
        )}

        {/* PDF Preview */}
        {!loading && fileType === "application/pdf" && (
          <object
            data={preview}
            type="application/pdf"
            width="100%"
            height="100%"
            style={{ borderRadius: "8px" }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              <ErrorOutlineIcon sx={{ fontSize: 48, color: "red" }} />
              <Typography variant="body1" sx={{ color: "red" }}>
                No data found
              </Typography>
            </Box>
          </object>
        )}

       {!loading &&
          fileType ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
            docxError ? (
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
              <ErrorOutlineIcon sx={{ fontSize: 48, color: "red" }} />
              <Typography variant="body1" sx={{ color: "red" }}>
                No data found
              </Typography>
            </Box>
            ) : (
              <div
                ref={docxContainerRef}
                style={{
                  flex: 1,
                  width: "100%",
                  overflow: "auto",
                  borderRadius: "8px",
                  padding: "20px",
                }}
              />
            )
        )}
          </>
          )}
      </Modal.Body>

      <Modal.Footer style={{ backgroundColor: "#2c3e50" }}>
      </Modal.Footer>
    </Modal>
  );
};

export default PreviewModal;
