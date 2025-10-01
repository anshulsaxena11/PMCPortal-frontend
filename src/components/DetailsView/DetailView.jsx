import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import { PiImagesSquareBold } from 'react-icons/pi'; 
import { FcDocument } from 'react-icons/fc'; 
import { Box, Typography, IconButton, Tooltip, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import ReadMoreLess  from '../../components/ReadMoreAndLess/ReadMoreLess'
import PreviewModal from '../previewfile/preview';
import dayjs from 'dayjs'

const DetailViewTable = ({
  title,
  data = {},
  loading = false,
  fields = [],
  labels = {},
  onBackClick,
  uploadedFile,
  fileType,
  nestedFields = {}, 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [filePreview, setFilePreview] = useState('');
  const [previewFileType, setPreviewFileType] = useState('');

  if (loading) return <div>Loading...</div>;


  const getFileTypeFromUrl = (url) => {
    const extension = url?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) return 'image/';
    if (extension === 'pdf') return 'application/pdf';
    if (extension === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    return 'unknown';
  };

  const handlePreviewClick = (url) => {
    const type = getFileTypeFromUrl(url);
    setFilePreview(url);
    setPreviewFileType(type);
    setShowModal(true);
  };

  return (
    <div>
      <Box display="flex" justifyContent="center" alignItems="center" position="relative" mb={3}>
        <Box position="absolute" left={0}>
          <Tooltip title="Back">
            <IconButton
              onClick={onBackClick}
              sx={{ backgroundColor: 'error.main', color: 'white', '&:hover': { backgroundColor: 'error.dark' }, width: 48, height: 48 }}
            >
              <ArrowBackIcon size={24} />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="h4" fontWeight="bold">{title}</Typography>
      </Box>

      <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }} />

      <Paper elevation={3} sx={{ maxWidth: '100%', margin: 'auto', p: 3, borderRadius: 2 }}>
        <Table bordered hover>
          <tbody>
            {fields.map((field, index) => {
              const label = labels?.[field] || field.replace(/([A-Z])/g, ' $1').toUpperCase();
              const value = data[field];

              // File preview handling
              if (['tenderDocument', 'workOrderUrl', 'certificateUrl','completetionCertificateUrl','clientFeedbackUrl','anyOtherDocumentUrl'].includes(field) && value) {
                return (
                  <tr key={index}>
                    <td><strong>{label}:</strong></td>
                    <td>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); handlePreviewClick(value); }}
                        className="btn btn-link"
                      >
                        {uploadedFile ? (
                          fileType.startsWith('image/') ? (
                            <>
                              <PiImagesSquareBold style={{ marginRight: '8px' }} />
                              Preview Image
                            </>
                          ) : (
                            <>
                              <FcDocument style={{ marginRight: '8px' }} />
                              Preview Document
                            </>
                          )
                        ) : 'Preview File'}
                      </a>
                    </td>
                  </tr>
                );
              }

     
              if (Array.isArray(value)) {
                if (field === "proofOfConcept") {
                  return (
                    <tr key={index}>
                      <td><strong>{label}:</strong></td>
                      <td>
                        {value.length > 0 ? (
                          <div
                            style={{
                              maxHeight: "250px",
                              maxWidth: "100%",
                              overflowX: "auto",
                              overflowY: "auto",
                            }}
                          >
                            <Table striped bordered hover size="sm">
                              <thead>
                                <tr>
                                  <th>S.No</th>
                                  <th>Step</th>
                                  <th>Description</th>
                                  <th>Proof</th>
                                </tr>
                              </thead>
                              <tbody>
                                {value.map((item, idx) => (
                                  <tr key={item._id || idx}>
                                    <td>{idx + 1}</td>
                                    <td>{item.noOfSteps || "N/A"}</td>
                                    <td>{item.description || "N/A"}</td>
                                    <td>
                                      {item.proofPreviwe ? (
                                        <a
                                          href="#"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handlePreviewClick(item.proofPreviwe);
                                          }}
                                          className="btn btn-link"
                                        >
                                          <PiImagesSquareBold style={{ marginRight: "8px" }} />
                                          Preview
                                        </a>
                                      ) : (
                                        "N/A"
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        ) : (
                          <span>No Proof of Concept available</span>
                        )}
                      </td>
                    </tr>
                  );
                }

      
                const showFields = nestedFields[field] || [];
                const showLabels = nestedFields[`${field}Labels`] || {};

                if (showFields.length === 0) {
                  return (
                    <tr key={index}>
                      <td><strong>{label}:</strong></td>
                      <td>No fields defined to display</td>
                    </tr>
                  );
                }

                return (
                  <tr key={index}>
                    <td><strong>{label}:</strong></td>
                    <td>
                      {value.length > 0 ? (
                        <div
                          style={{
                            maxHeight: "200px",
                            maxWidth: "100%",
                            overflowX: "auto",
                            overflowY: "auto",
                          }}
                        >
                          <Table striped bordered hover size="sm">
                            <thead>
                              <tr>
                                <th>S.No</th>
                                <th>{label}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {value
                                .sort((a, b) => new Date(b.commentedOn) - new Date(a.commentedOn))
                                .map((item, idx) => (
                                  <tr key={item._id || idx}>
                                    <td style={{ verticalAlign: "top", width: "60px" }}>
                                      {idx + 1}
                                    </td>
                                    <td style={{ textAlign: "justify" }}>
                                      <div>
                                        By{" "}
                                        <span className="fw-bold">
                                          {item.displayName || "Unknown"}
                                        </span>{" "}
                                        on{" "}
                                        {item.commentedOn ? (
                                          <>
                                            <span className="fw-bold">
                                              {dayjs(item.commentedOn).format("D MMMM YYYY")}
                                            </span>{" "}
                                            at{" "}
                                            <span className="fw-bold">
                                              {dayjs(item.commentedOn).format("h:mm A")}
                                            </span>
                                          </>
                                        ) : (
                                          "N/A"
                                        )}
                                      </div>
                                      <div>
                                        <ReadMoreLess
                                          text={item.comments ?? "N/A"}
                                          limit={120}
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </Table>
                        </div>
                      ) : (
                        <span>No {label} available</span>
                      )}
                    </td>
                  </tr>
                );
              }

  
              return (
                <tr key={index}>
                  <td><strong>{label}:</strong></td>
                  <td>{value ?? 'N/A'}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Paper>

      <PreviewModal
        show={showModal}
        onHide={() => setShowModal(false)}
        preview={filePreview}
        fileType={previewFileType}
      />
    </div>
  );
};

export default DetailViewTable;
