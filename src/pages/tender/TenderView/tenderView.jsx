import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import PreviewModal from '../../../components/previewfile/preview';
import { TiArrowBack } from "react-icons/ti";
import { getTrackingById } from '../../../api/TenderTrackingAPI/tenderTrackingApi';
import { PiImagesSquareBold } from "react-icons/pi";

const TenderTrackingView = ({ ID }) => {
  const { register, reset,watch } = useForm();
  const { id } = useParams();
  const trackingId = ID || id;
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [previewFileType, setPreviewFileType] = useState("");
  const rawValue = watch("valueINR");

  useEffect(() => {
    const fetchTrackingTenderDetails = async () => {
      try {
        const data = await getTrackingById(trackingId);
        const fetchedData = data.data;
        if (fetchedData) {
          const formattedLastDate = fetchedData.lastDate
            ? fetchedData.lastDate.split("T")[0]
            : "";

          reset({
            ...fetchedData,
            lastDate: formattedLastDate,
          });

          if (fetchedData.tenderDocument) {
           const fullUrl = fetchedData.tenderDocument.startsWith("http")
            ? fetchedData.tenderDocument
            : `${window.location.origin}${fetchedData.tenderDocument}`;
            setFileUrl(fullUrl)
            setFilePreviewUrl(fullUrl)
          }
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };
    fetchTrackingTenderDetails();
  }, []);

  const handleBackClick = () => {
    navigate(`/tender-list`);
  };

  const getFileTypeFromUrl = (url) => {
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
  const handlePreviewClick = (url) => {
    const fileType = getFileTypeFromUrl(url);
    setFilePreviewUrl(url);
    setPreviewFileType(fileType);
    setShowModal(true);
  };
const formattedValue = rawValue
  ? new Intl.NumberFormat("en-IN").format(Number(rawValue))
  : "";

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-sm-10 col-md-10 col-lg-10">
          <h1 className="fw-bolder">Tender Tracking View</h1>
        </div>
        <div className="col-sm-2 col-md-2 col-lg-2">
          <Button variant="danger" className="btn btn-success" onClick={handleBackClick}>
            <TiArrowBack />BACK
          </Button>
        </div>
      </div>
      <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }} />

      <form>
        <div className="row pt-4">
          <div className="col-sm-6 col-md-6 col-lg-6">
            <Form.Group className="pt-4">
              <Form.Label className="fs-5 fw-bolder">Tender Name<span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" {...register("tenderName")} readOnly disabled />
            </Form.Group>
            <Form.Group className="pt-4">
              <Form.Label className="fs-5 fw-bolder">Organization Name<span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" {...register("organizationName")} readOnly disabled />
            </Form.Group>
            <Form.Group className="pt-4">
              <Form.Label className="fs-5 fw-bolder">State<span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" {...register("state")} readOnly disabled />
            </Form.Group>
            <Form.Group className="pt-4">
              <Form.Label className="fs-5 fw-bolder">Task Force Member<span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" {...register("taskForce")} readOnly disabled />
            </Form.Group>
          </div>

          <div className="col-sm-6 col-md-6 col-lg-6">
            <Form.Group className="pt-4">
              <Form.Label className="fs-5 fw-bolder">Value ₹ (GST)<span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" {...register("valueINR")} value={formattedValue} readOnly disabled/>
            </Form.Group>
            <Form.Group className="pt-4">
              <Form.Label className="fs-5 fw-bolder">Status<span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" {...register("status")} readOnly disabled />
            </Form.Group>
            <Form.Group className="pt-4">
              <Form.Label className="fs-5 fw-bolder">Last Date<span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" {...register("lastDate")} readOnly disabled />
            </Form.Group>
             <Form.Group className="mb-3 pt-4" >
                <Form.Label className="fs-5 fw-bolder">Tender Document Upload (PDF, DOC, Image)<span className="text-danger">*</span></Form.Label>
                {fileUrl && (
                <div className="mt-2" style={{ cursor: "pointer" }}>
                    <h6 onClick={() => handlePreviewClick(filePreviewUrl)}>
                    <PiImagesSquareBold style={{ marginRight: "8px" }} />
                    Preview Uploaded File
                    </h6>
                </div>
                )}
            <PreviewModal
              show={showModal}
              onHide={() => setShowModal(false)}
              preview={filePreviewUrl}
              fileType={previewFileType}
            />
            </Form.Group>
          </div>
        </div>

        <Button variant="danger" className="btn btn-success my-5" onClick={handleBackClick}>
          <TiArrowBack />BACK
        </Button>
      </form>
    </div>
  );
};

export default TenderTrackingView;
