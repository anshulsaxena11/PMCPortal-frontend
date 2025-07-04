import React, { useState } from 'react';
import { Row, Col, Button, Table } from 'react-bootstrap';
import { PiImagesSquareBold } from 'react-icons/pi'; 
import { FcDocument } from 'react-icons/fc'; 
import { TiArrowBack } from "react-icons/ti";
import PreviewModal from '../previewfile/preview';  

const DetailView = ({ title, data, loading, fields, labels, buttonName, onBackClick, uploadedFile, fileType }) => {
  const [showModal, setShowModal] = useState(false);
  const [filePreview, setFilePreview] = useState('');
  const [previewFileType, setPreviewFileType] = useState('');

  if (loading) {
    return <div>Loading...</div>;
  }


  const getFileTypeFromUrl = (url) => {
    const extension = url?.split('.').pop(); 

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return 'image/'; 
    } else if (extension === 'pdf') {
      return 'application/pdf'; 
    } else {
      return 'unknown';
    }
  };


  const handlePreviewClick = (url) => {
    const fileType = getFileTypeFromUrl(url);
    setFilePreview(url); // Directly set the URL for preview
    setPreviewFileType(fileType);
    setShowModal(true);
  };

  return (
    <div>
      <div className='row'>
        <div className='col-sm-10 col-md-10 col-lg-10'>
          <h1>{title}</h1>
        </div>
        <div className='col-sm-2 col-lg-2 col-md-2 pt-2'>
          <Button variant="danger" className='btn btn-success ' onClick={onBackClick}>
            <TiArrowBack />{buttonName}
          </Button>
        </div>
      </div>
      <hr />
      <Row className="mb-4">
        {fields.map((field, index) => {
          const label = labels?.[field] || field.replace(/([A-Z])/g, ' $1').toUpperCase();

          // Render preview link for 'workOrderUrl' field if it exists
          if (field === 'workOrderUrl' && data?.workOrderUrl) {
            return (
              <Col xs={12} className="py-4" key={index}>
                <h5>
                  <strong>{labels?.workOrderUrl || 'Work Order'}: </strong>
                </h5>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePreviewClick(data.workOrderUrl); // Handle preview click
                  }}
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
                  ) : (
                    'Preview File'
                  )}
                </a>
              </Col>
            );
          }

          // Render project type if it's an array
          if (field === 'projectType' && Array.isArray(data?.[field])) {
            return (
              <Col xs={12} sm={6} lg={4} key={index} className="py-4">
                <h5>
                  <strong>{label}: </strong>
                  <span className="fs-5">
                    {data?.projectType.map((item, idx) => (
                      <span key={idx}>{item.ProjectTypeName}{idx < data.projectType.length - 1 && ', '}</span>
                    ))}
                  </span>
                </h5>
              </Col>
            );
          }

          if (field === "proofOfConcept" && Array.isArray(data?.proofOfConcept)) {
            return (
              <Col xs={12} key={index} className="py-4">
                <h5>
                  <strong>Proof of Concept:</strong>
                </h5>
                <Table bordered hover>
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
                              onClick={(e) => {
                                e.preventDefault();
                                handlePreviewClick(item.proofPreviwe);
                              }}
                              className="btn btn-link"
                            >
                              {getFileTypeFromUrl(item.proof).startsWith("image/") ? (
                                <PiImagesSquareBold style={{ marginRight: "8px" }} />
                              ) : (
                                <FcDocument style={{ marginRight: "8px" }} />
                              )}
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
              </Col>
            );
          }

          const fieldValue = data?.[field];
          const renderValue = fieldValue || 'N/A';

          return (
            <Col xs={12} sm={6} lg={4} key={index} className="py-4">
              <h5>
                <strong>{label}: </strong>
                <span className="fs-5">{renderValue}</span>
              </h5>
            </Col>
          );
        })}
      </Row>

      <Button variant="danger" className='btn btn-success ' onClick={onBackClick}>
       <TiArrowBack /> {buttonName}
      </Button>

      {/* Modal for preview */}
      <PreviewModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        preview={filePreview} 
        fileType={previewFileType} 
      />
    </div>
  );
};

export default DetailView;
