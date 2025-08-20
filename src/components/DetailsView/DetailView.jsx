import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import { PiImagesSquareBold } from 'react-icons/pi'; 
import { FcDocument } from 'react-icons/fc'; 
import { Box, Typography, Button, IconButton, Tooltip, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import PreviewModal from '../previewfile/preview';  

const DetailViewTable = ({ title, data, loading, fields, labels, onBackClick, uploadedFile, fileType }) => {
  const [showModal, setShowModal] = useState(false);
  const [filePreview, setFilePreview] = useState('');
  const [previewFileType, setPreviewFileType] = useState('');

  if (loading) {
    return <div>Loading...</div>;
  }

  const getFileTypeFromUrl = (url) => {
    const extension = url?.split('.').pop(); 
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) return 'image/'; 
    if (extension === 'pdf') return 'application/pdf'; 
    return 'unknown';
  };

  const getFileTypeFromUrlTender = (url) => {
    const extension = url?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return 'image/';
    } else if (extension === 'pdf') {
      return 'application/pdf';
    }  else if (extension === 'docx') {
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }else {
      return 'unknown';
    }
  };
 const handlePreviewClickTender = (url) => {
    const type = getFileTypeFromUrlTender(url);
    setFilePreview(url);
    setPreviewFileType(type);
    setShowModal(true);
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
              sx={{
                backgroundColor: 'error.main',
                color: 'white',
                '&:hover': { backgroundColor: 'error.dark' },
                width: 48,
                height: 48,
              }}
            >
              <ArrowBackIcon size={24} />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="h4" fontWeight="bold">{title}</Typography>
      </Box>

      <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }} />

      <Paper elevation={3} sx={{ maxWidth: '100%', margin: "auto", p: 3, borderRadius: 2 }}>
        <Table bordered hover>
          <tbody>
            {fields.map((field, index) => {
              const label = labels?.[field] || field.replace(/([A-Z])/g, ' $1').toUpperCase();

              // Work Order File
              if (field === 'workOrderUrl' && data?.workOrderUrl) {
                return (
                  <tr key={index}>
                    <td><strong>{labels?.workOrderUrl || 'Work Order'}:</strong></td>
                    <td>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); handlePreviewClick(data.workOrderUrl); }}
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
              //tenderDocument
               if (field === 'tenderDocument' && data?.tenderDocument) {
                return (
                  <tr key={index}>
                    <td><strong>{labels?.tenderDocument || 'Tender Document'}:</strong></td>
                    <td>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); handlePreviewClickTender(data.tenderDocument); }}
                        className="btn btn-link"
                      >
                        {uploadedFile ? (
                          getFileTypeFromUrlTender.startsWith('image/') ? (
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

              // Project Type Array
              if (field === 'projectType' && Array.isArray(data?.[field])) {
                return (
                  <tr key={index}>
                    <td><strong>{label}:</strong></td>
                    <td>
                      {data.projectType.map((item, idx) => (
                        <span key={idx}>
                          {item.ProjectTypeName}
                          {idx < data.projectType.length - 1 && ', '}
                        </span>
                      ))}
                    </td>
                  </tr>
                );
              }

              // Proof of Concept Table
              if (field === "proofOfConcept" && Array.isArray(data?.proofOfConcept)) {
                return (
                  <tr key={index}>
                    <td><strong>Proof of Concept:</strong></td>
                    <td>
                      <Table bordered hover size="sm">
                        <thead>
                          <tr>
                            <th>No. of Steps</th>
                            <th>Description</th>
                            <th>Proof</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.proofOfConcept.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.noOfSteps || "N/A"}</td>
                              <td>{item.description || "N/A"}</td>
                              <td>
                                {item.proof ? (
                                  <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); handlePreviewClick(item.proofPreviwe); }}
                                    className="btn btn-link"
                                  >
                                    {getFileTypeFromUrl(item.proof).startsWith("image/") ? (
                                      <PiImagesSquareBold style={{ marginRight: "8px" }} />
                                    ) : (
                                      <FcDocument style={{ marginRight: "8px" }} />
                                    )}
                                    Preview
                                  </a>
                                ) : "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </td>
                  </tr>
                );
              }

              // Default field rendering
              const fieldValue = data?.[field] || 'N/A';
              return (
                <tr key={index}>
                  <td><strong>{label}:</strong></td>
                  <td>{fieldValue}</td>
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
