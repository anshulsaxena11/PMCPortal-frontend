import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import { getEmpDataById, getEmployeeProjects } from "../../api/syncEmp/syncEmp";
import {getCertificateByUserId} from '../../api/certificateApi/certificate';

const UserProfile = ({ ID }) => {
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/certificate-form"); // Replace with your target route
  };

  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) setUserId(storedUserId);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchUserDetails = async () => {
      try {
        const data = await getEmpDataById(userId);
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

        setUserDetails(formattedData);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const fetchProjects = async () => {
      try {
        const res = await getEmployeeProjects(userId);
        setProjects(res?.data || []);

      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };

    fetchProjects();
  }, [userId]);

 
   useEffect(() => {
    if (!userId) return;
        console.log(userId);
     const fetchCertificates = async () => {
      try {
        const response = await getCertificateByUserId(userId);
        console.log('erhrtrtjtyhyt');
        console.log(response);
        setCertificates(response.data); 
        console.log('sfegegewgegggggggg');
        console.log(response);
      } catch (err) {
        setError('Failed to fetch certificates.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [userId]);


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
                  src="/images/default_image_profile.jpg"
                  alt="profile"
                  className="rounded-circle me-3"
                  width="80"
                  height="80"
                />
                <div>
                  <h5 className="mb-1">{userDetails.ename}</h5>
                  <p className="text-muted mb-1">ID: {userDetails.empid}</p>
                  <button className="btn btn-outline-secondary btn-sm">
                    Change Password
                  </button>
                </div>
              </div>

              <div className="row g-3">
                <h5 className="mb-1">Skills Rating</h5>
                {userDetails?.skills && userDetails.skills.length > 0 ? (
                userDetails?.skills?.map((skill, index) => (
                  <div className="col-md-3" key={index}>
                    <label className="form-label">{skill.ProjectTypeName}</label>
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
                    // Determine badge color
                    let badgeClass = "bg-secondary"; // default
                    if (project.amountStatus?.toLowerCase() === "completed") {
                        badgeClass = "bg-success";
                    } else if (project.amountStatus?.toLowerCase() === "on going") {
                        badgeClass = "bg-warning";
                    }

                    return (
                        <div key={project._id} className="d-flex justify-content-between align-items-center mb-2">
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
      <ol className="list-group list-group-numbered">
        {certificates.map((certificate, index) => (
          <li key={certificate._id} className="list-group-item d-flex justify-content-between align-items-center">
            {certificate.certificateName.certificateName}
            <a href={certificate.certificateUrl} target="_blank" rel="noopener noreferrer" className="btn btn-link btn-sm">
              View Certificate
            </a>
          </li>
        ))}
      </ol>
    </div>
  </div>
</div>

          </div>
        </>
      ) : (
        <p>No user details found</p>
      )}
    </div>
  );
};

export default UserProfile;
