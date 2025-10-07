import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import PreviewModal from "../../components/previewfile/preview";
import { getEmpDataById, getEmployeeProjects } from "../../api/syncEmp/syncEmp";
import { getCertificateByUserId } from "../../api/certificateApi/certificate";

const UserProfile = ({ ID }) => {
    const { id } = useParams();
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/certificate-form"); // Replace with your target route
  };

  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [error, setError] = useState(null);

  // Preview modal states
  const [showModal, setShowModal] = useState(false);
  const [filePreview, setFilePreview] = useState("");
  const [previewFileType, setPreviewFileType] = useState("");

  // Fetch user details
  useEffect(() => {
    console.log(id);
    if (!id) return;

    const fetchUserDetails = async () => {
      try {
        const data = await getEmpDataById(id);
        const item = data?.data;

        const formattedData = {
          ...item,
          StatusNoida: item?.StatusNoida ? (
            <span className="text-success fw-bold">Active</span>
          ) : (
            <span className="text-danger fw-bold">Inactive</span>
          ),
          taskForceMember:
            item?.taskForceMember === "No" ? (
              <span className="text-danger fw-bold">No</span>
            ) : (
              <span className="text-success fw-bold">Yes</span>
            ),
        };
        console.log(formattedData)

        setUserDetails(formattedData);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  // Fetch projects
  useEffect(() => {
    if (!id) return;

    const fetchProjects = async () => {
      try {
        const res = await getEmployeeProjects(id);
        setProjects(res?.data || []);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };

    fetchProjects();
  }, [id]);

  // Fetch certificates
  useEffect(() => {
    if (!id) return;

    const fetchCertificates = async () => {
      try {
        const response = await getCertificateByUserId(id);
        setCertificates(response.data || []);
      } catch (err) {
        setError("Failed to fetch certificates.");
        console.error(err);
      }
    };

    fetchCertificates();
  }, [id]);

  // Detect file type
  const getFileTypeFromUrl = (url) => {
    const extension = url?.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension))
      return "image/";
    if (extension === "pdf") return "application/pdf";
    if (extension === "docx")
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    return "unknown";
  };

  // Handle preview
  const handlePreviewClick = (url) => {
    const isAbsolute = url.startsWith("http");
    const fullUrl = isAbsolute ? url : `${window.location.origin}${url}`;
    const type = getFileTypeFromUrl(fullUrl);

    setFilePreview(fullUrl);
    setPreviewFileType(type);
    setShowModal(true);
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">User Profile</h3>

      {loading ? (
        <p>Loading...</p>
      ) : userDetails ? (
        <>
          {/* Basic Info */}
          <div className="card mb-4">
            <div className="card-header fw-bold">Basic Info</div>
            <div className="card-body">
              <div className="d-flex align-items-center mb-4">
                <img
                  src={userDetails.photo}
                  alt="profile"
                  className="rounded-circle me-3"
                  width="80"
                  height="80"
                />
                <div>
                  <h5 className="mb-1">{userDetails.ename}</h5>
                  <p className="text-muted mb-1">ID: {userDetails.empid}</p>
                 {/* <button className="btn btn-outline-secondary btn-sm">
                    Change Password
                  </button> */ }
                </div>
              </div>

              <div className="row g-3">
                <h5 className="mb-1">Skills Rating</h5>
                {userDetails?.skills && userDetails.skills.length > 0 ? (
                  userDetails.skills.map((skill, index) => (
                    <div className="col-md-3" key={index}>
                      <label className="form-label">
                        {skill.ProjectTypeName}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={skill.rating}
                        readOnly
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No skills rating available</p>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            {/* Projects */}
            <div className="col-md-6 mb-4">
              <div className="card">
                <div className="card-header fw-bold">Projects</div>
                <div className="card-body">
                  {projects.length ? (
                    projects.map((project, index) => {
                      let badgeClass = "bg-secondary"; // default
                      if (project.amountStatus?.toLowerCase() === "completed") {
                        badgeClass = "bg-success";
                      } else if (
                        project.amountStatus?.toLowerCase() === "on going"
                      ) {
                        badgeClass = "bg-warning";
                      }

                      return (
                        <div
                          key={project._id}
                          className="d-flex justify-content-between align-items-center mb-2"
                        >
                          <label className="form-label mb-0">
                            {index + 1}. {project.projectName}
                          </label>
                          <span className={`badge ${badgeClass} text-white`}>
                            {project.amountStatus || "No status"}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-12">
                      <p>No projects found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Certificates */}
            <div className="col-md-6 mb-4">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                  <span>Certificates</span>
                  <Button variant="primary" size="sm" onClick={handleNavigate}>
                    Add New
                  </Button>
                </div>
                <div className="card-body">
                  {certificates.length ? (
                    <ol className="list-group list-group-numbered">
                      {certificates.map((certificate, index) => (
                        <li
                          key={certificate._id || index}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <span>{certificate.certificateName.certificateName || "No Name"}</span>

                          {certificate.certificateUrl && (
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() =>
                                handlePreviewClick(certificate.certificateUrl)
                              }
                            >
                              Preview
                            </Button>
                          )}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p>No certificates found</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Modal (rendered once) */}
          <PreviewModal
            show={showModal}
            onHide={() => setShowModal(false)}
            preview={filePreview}
            fileType={previewFileType}
          />
        </>
      ) : (
        <p>No user details found</p>
      )}
    </div>
  );
};

export default UserProfile;
