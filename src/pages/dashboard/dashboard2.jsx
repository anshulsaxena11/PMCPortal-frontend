// Updated CategoryCount.jsx with fixed work type fetching
import React, { useEffect, useState } from "react";
import { getAllReportList } from '../../api/reportApi/reportApi';
import { getAllProjectDetails } from '../../api/ProjectDetailsAPI/projectDetailsApi';
import dayjs from 'dayjs';

const CategoryCount = () => {
  const [countsName, setCountsName] = useState({});
  const [countsType, setCountsType] = useState({});
  const [records, setRecords] = useState([]);
  const [workRecords, setWorkRecords] = useState([]);
  const [workCounts, setWorkCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState({ type: null, name: null, work: null });
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [reportResponse, workResponse] = await Promise.all([
          getAllReportList(),
          getAllProjectDetails(),
        ]);

        const reportData = Array.isArray(reportResponse) ? reportResponse : reportResponse.data;
        const workData = Array.isArray(workResponse) ? workResponse : workResponse.data;

        setRecords(reportData);
        setWorkRecords(workData);

        const nameCounts = {};
        const typeCounts = {};
        const workTypeCounts = {};

        reportData.forEach(item => {
          const nameKey = item.projectName?.projectName?.trim() || "Unknown";
          const typeKey = item.projectType?.trim() || "Unknown";

          nameCounts[nameKey] = (nameCounts[nameKey] || 0) + 1;
          typeCounts[typeKey] = (typeCounts[typeKey] || 0) + 1;
        });

        workData.forEach(work => {
          const typeKey = work.typeOfWork?.trim() || "Unknown";
          workTypeCounts[typeKey] = (workTypeCounts[typeKey] || 0) + 1;
        });

        setCountsName(nameCounts);
        setCountsType(typeCounts);
        setWorkCounts(workTypeCounts);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const total = (obj) => Object.values(obj).reduce((acc, val) => acc + val, 0);

  const handleWorkClick = (type) => {
    const filtered = workRecords.filter(
      item => (item.typeOfWork?.trim() || "Unknown") === type
    );
    setSelectedFilter({ work: type, name: null, type: null });
    setFilteredData(filtered);
  };

  const renderCategoryBox = (label, count, color, onClick) => (
    <div
      onClick={onClick}
      style={{
        backgroundColor: color,
        margin: "10px",
        padding: "20px",
        borderRadius: "10px",
        color: "#fff",
        minWidth: "200px",
        textAlign: "center",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = "#fff";
        e.currentTarget.style.color = "#000";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = color;
        e.currentTarget.style.color = "#fff";
      }}
    >
      <h3>{label}</h3>
      <p style={{ fontSize: "22px", margin: 0 }}>{count}</p>
    </div>
  );

  const renderModal = () => {
    if (!selectedFilter.name && !selectedFilter.type && !selectedFilter.work) return null;

    const title = selectedFilter.name || selectedFilter.type || selectedFilter.work;

    return (
      <div
        style={{
          position: "fixed",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 0 15px rgba(0,0,0,0.3)",
          zIndex: 1000,
          width: "80%",
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        <button
          onClick={() => {
            setSelectedFilter({ name: null, type: null, work: null });
            setFilteredData([]);
          }}
          style={{
            float: "right",
            background: "red",
            color: "white",
            border: "none",
            padding: "5px 10px",
            borderRadius: "5px",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          Close
        </button>
        <h3>{title} - Details</h3>

        {filteredData.length === 0 ? (
          <p>No data found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f2f2f2", textAlign: "left" }}>
                {selectedFilter.work ? (
                  <>
                    <th style={{ padding: "8px", border: "1px solid #ccc" }}>Type of Work Name</th>
                    <th style={{ padding: "8px", border: "1px solid #ccc" }}>Start Date</th>
                    <th style={{ padding: "8px", border: "1px solid #ccc" }}>Directorate</th>
                    <th style={{ padding: "8px", border: "1px solid #ccc" }}>Value</th>
                    <th style={{ padding: "8px", border: "1px solid #ccc" }}>Owner Name</th>

                  </>
                ) : (
                  <>
                    <th style={{ padding: "8px", border: "1px solid #ccc" }}>Project Name</th>
                    <th style={{ padding: "8px", border: "1px solid #ccc" }}>Project Type</th>
                    <th style={{ padding: "8px", border: "1px solid #ccc" }}>Vulnerability Name</th>
                    <th style={{ padding: "8px", border: "1px solid #ccc" }}>Severity</th>
                    <th style={{ padding: "8px", border: "1px solid #ccc" }}>Created At</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  {selectedFilter.work ? (
                    <>
                      <td style={{ padding: "8px", border: "1px solid #ccc" }}>{item.typeOfWork || "N/A"}</td>
                      <td style={{ padding: "8px", border: "1px solid #ccc" }}>{item.startDate ? dayjs(item.startDate).format('DD-MM-YYYY') : 'N/A'}</td>
                      <td style={{ padding: "8px", border: "1px solid #ccc" }}>{item.directrate || "N/A"}</td>
                      <td style={{ padding: "8px", border: "1px solid #ccc" }}>{item.projectValue || "N/A"}</td>
                      <td style={{ padding: "8px", border: "1px solid #ccc" }}>{item.primaryPersonName || "N/A"}</td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: "8px", border: "1px solid #ccc" }}>{item.projectName?.projectName || "N/A"}</td>
                      <td style={{ padding: "8px", border: "1px solid #ccc" }}>{item.projectType || "N/A"}</td>
                      <td style={{ padding: "8px", border: "1px solid #ccc" }}>{item.vulnerabilityName || "N/A"}</td>
                      <td style={{ padding: "8px", border: "1px solid #ccc" }}>{item.sevirty || "N/A"}</td>
                      <td style={{ padding: "8px", border: "1px solid #ccc" }}>{item.createdAt ? dayjs(item.createdAt).format('DD-MM-YYYY') : 'N/A'}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  return (
    <div>
      <h3>Project Name</h3>
      <div style={{ display: "flex", flexWrap: "wrap", maxHeight: "300px", overflowY: "auto" }}>
        {renderCategoryBox("Total", total(countsName), "#a9b8a4", () => {})}
        {Object.entries(countsName).map(([name, count]) =>
          renderCategoryBox(name, count, "#a9b8a4", () => {
            const filtered = records.filter(item => (item.projectName?.projectName?.trim() || "Unknown") === name);
            setSelectedFilter({ name, type: null, work: null });
            setFilteredData(filtered);
          })
        )}
      </div>

      <h3>Project Type</h3>
      <div style={{ display: "flex", flexWrap: "wrap", maxHeight: "300px", overflowY: "auto" }}>
        {renderCategoryBox("Total", total(countsType), "#4b7d7e", () => {})}
        {Object.entries(countsType).map(([type, count]) =>
          renderCategoryBox(type, count, "#4b7d7e", () => {
            const filtered = records.filter(item => (item.projectType?.trim() || "Unknown") === type);
            setSelectedFilter({ type, name: null, work: null });
            setFilteredData(filtered);
          })
        )}
      </div>

      <h3>Work Type</h3>
      <div style={{ display: "flex", flexWrap: "wrap", maxHeight: "300px", overflowY: "auto" }}>
        {renderCategoryBox("Total", total(workCounts), "#9c5d5d", () => {})}
        {Object.entries(workCounts).map(([type, count]) =>
          renderCategoryBox(type, count, "#9c5d5d", () => handleWorkClick(type))
        )}
      </div>

      {renderModal()}
    </div>
  );
};

export default CategoryCount;
