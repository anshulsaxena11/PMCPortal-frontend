
import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, TextField, Stack, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import { Card } from "react-bootstrap";
import dayjs from 'dayjs';
import { DatePicker } from "@mui/x-date-pickers";
import { getProjectDetailsList } from '../../api/ProjectDetailsAPI/projectDetailsApi';
import CustomDataGrid from '../../components/DataGrid/CustomDataGrid';
import { getAllTenderList } from '../../api/TenderTrackingAPI/tenderTrackingApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2pdf from 'html2pdf.js';
// --- DataGrid Columns (Same as before) ---
const tenderCols = [
  { field: 'sno', headerName: 'S.No', width: 80 },
  { field: 'tenderName', headerName: 'Tender Name', flex: 1 },
  { field: 'organizationName', headerName: 'Organization Name', flex: 1 },
  { field: 'ename', headerName: 'Task Force', flex: 1 },
  {
    field: "directrate",
    headerName: "Directorate",
    flex: 1,
    renderCell: (params) => params.value || "N/A", 
  },
  { field: 'stateName', headerName: 'State', flex: 1 },
  {
    field: 'valueINR',
    headerName: 'Value (Lakhs INR)',
    flex: 1,
    align: 'right',
    renderCell: (params) => {
      const val = params?.row?.valueINR;
      if (!val || isNaN(val)) return 'N/A';
      const croreValue = Number(val) / 100000;
      const formattedCr = croreValue.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const fullValue = 'Rs. ' + Number(val).toLocaleString('en-IN');
      return (
        <Tooltip title={fullValue} INR>
          <span>{formattedCr} Lakhs</span>
        </Tooltip>
      );
    }
  },
  { field: 'status', headerName: 'Status', flex: 1 },
  {
    field: 'lastDate',
    headerName: 'Last Date',
    flex: 1,
    renderCell: (params) => {
      if (params.value) {
        return dayjs(params.value).format('YYYY-MM-DD');
      }
      return 'N/A';
    },
  },
];

const projectCols = [
  { field: 'projectName', headerName: 'Project Name' },
  { field: 'directrate', headerName: 'Directorate' },
  { field: 'orginisationName', headerName: 'Organization' },
  { field: 'status', headerName: 'Status' },
  { field: 'startDate', headerName: 'Start Date' },
  { field: 'endDate', headerName: 'End Date' },
  { field: 'projectValue', headerName: 'Value' },
];
// ----------------------------------------------------

// --- Utility Functions (UPDATED to include Tender FY grouping) ---
function groupByFinancialYearTender(data) {
    const yearMap = {};
    data.forEach((tender) => {
        const { lastDate, valueINR } = tender;
        // Use lastDate as proxy for tender year
        if (!lastDate) return; 
        const date = new Date(lastDate);
        const month = date.getMonth();
        const year = date.getFullYear();
        const fyStartYear = month < 3 ? year - 1 : year;
        const fyEndYear = fyStartYear + 1;
        const fyLabel = `FY-${fyStartYear}-${fyEndYear}`;
        const value = parseFloat(valueINR || "0");

        if (!yearMap[fyLabel]) {
            yearMap[fyLabel] = { financialYear: fyLabel, Total: 0, startYear: fyStartYear };
        }
        yearMap[fyLabel].Total += value;
    });

    return Object.values(yearMap)
        .map(({ financialYear, Total, startYear }) => ({
            financialYear,
            Total: +(Total / 100000).toFixed(2), // Convert to Lakhs
            startYear,
        }))
        .sort((a, b) => a.startYear - b.startYear)
        .map(({ financialYear, Total }) => ({ financialYear, Total }));
}

function getFilteredRows(rows, term) {
    const lower = term.toLowerCase().trim();
    if (!lower) return rows;
    return rows.filter((row) =>
        Object.values(row).some(
            (val) => String(val || "").toLowerCase().includes(lower)
        )
    );
}
// ----------------------------------------------------

export default function ReportDashboard() {
  // --- State ---
  const [search, setSearch] = useState('');
  const [tenderRows, setTendereRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedDirectorateTender, setSelectedDirectorateTender] = useState("All"); 
  const [selectedProjectPdfCols, setSelectedProjectPdfCols] = useState(projectCols.map(c => c.field));
  const [directorateTenderOptions, setDirectorateTenderOptions] = useState([]); 
  const [directorateTenderData, setDirectorateTenderData] = useState([]); 
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [stats, setStats] = useState([]); 
  const [chartData, setChartData] = useState([]); 
  const [selectedFY, setSelectedFY] = useState("All"); // NEW FY state
  const [financialYears, setFinancialYears] = useState([]); // NEW FY state
  const [currentSummary, setCurrentSummary] = useState(null); // <-- new
  const [deletedSummary, setDeletedSummary] = useState(null); // <-- new
  const chartDivRef = useRef(null);            // DOM container ref
  const chartInstanceRef = useRef(null);       // amCharts chart instance ref
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateError, setDateError] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfTitle, setPdfTitle] = useState('Tender Tracking Report');
  const [selectedPdfCols, setSelectedPdfCols] = useState(tenderCols.map(c => c.field));
  const [pdfModalDirectorate, setPdfModalDirectorate] = useState('All');
  
  // Handlers for date pickers with validation: ensure endDate >= startDate
  const handleStartDateChange = (newValue) => {
    setStartDate(newValue);
    try {
      const sd = newValue ? dayjs(newValue) : null;
      const ed = endDate ? dayjs(endDate) : null;
      if (sd && ed && ed.isBefore(sd, 'day')) {
        setDateError('End date cannot be earlier than start date');
      } else {
        setDateError(null);
      }
    } catch (e) {
      // if dayjs parsing fails, clear validation and allow fetch to skip date filtering
      setDateError(null);
    }
  };

  const handleEndDateChange = (newValue) => {
    setEndDate(newValue);
    try {
      const sd = startDate ? dayjs(startDate) : null;
      const ed = newValue ? dayjs(newValue) : null;
      if (sd && ed && ed.isBefore(sd, 'day')) {
        setDateError('End date cannot be earlier than start date');
      } else {
        setDateError(null);
      }
    } catch (e) {
      setDateError(null);
    }
  };
  // -------------

  // --- Financial Year Calculation (OnInit) ---
  useEffect(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const fyStartYear = currentMonth < 3 ? currentYear - 1 : currentYear;
    const fyEndYear = fyStartYear + 1;
    const currentFY = `FY-${fyStartYear}-${fyEndYear}`;
    const years = [];
    for (let i = 5; i >= 1; i--) {
      const start = fyStartYear - i;
      const end = start + 1;
      years.push(`FY-${start}-${end}`);
    }
    years.push(currentFY);
    setFinancialYears(["All", ...years]);
  }, []);
  // -------------------------------------------


  // --- Export Functionality (UPDATED CSV - uses basic browser download) ---
  const exportToCsv = (data, filename = 'tender_data') => {
    // Helper function to convert data to CSV string
    const convertToCSV = (arr) => {
        const headers = tenderCols.map(col => col.headerName).join(',');
        const rows = arr.map(row => 
            tenderCols.map(col => {
                let value = row[col.field];
                
                // Format display values for export
                if (col.field === 'lastDate' && value) {
                    value = dayjs(value).format('YYYY-MM-DD');
                } else if (col.field === 'valueINR') {
                    value = (Number(value) / 100000).toFixed(2); // Export as Lakhs value
                }

                // Handle commas in text fields
                return `"${String(value || '').replace(/"/g, '""')}"`;
            }).join(',')
        );
        return [headers, ...rows].join('\n');
    };

    const csvData = convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) { 
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const exportToPdf = (data, filename = 'tender_data') => {
    // PDF export logic remains the same (uses jspdf and jspdf-autotable)
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.text(`Tender Tracking Report - Filter: ${selectedFY} / ${selectedDirectorateTender}`, 14, 10);

    const headers = [tenderCols.map(col => col.headerName)];
    const body = data.map(row => 
        tenderCols.map(col => {
            if (col.field === 'lastDate' && row[col.field]) {
                return dayjs(row[col.field]).format('YYYY-MM-DD');
            }
            if (col.field === 'valueINR') {
                const val = Number(row.valueINR) || 0;
                return (val / 100000).toFixed(2) + ' Lakhs';
            }
            return String(row[col.field] || 'N/A');
        })
    );

    autoTable(doc, {
      head: headers,
      body: body,
      startY: 15,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 144, 255] },
    });
    doc.save(`${filename}.pdf`);
  };

  // Helper function to sanitize text for PDF (keep Unicode but limit length)
  const sanitizeTextForPdf = (text) => {
    if (!text) return 'N/A';
    // Keep all characters including Hindi, just limit length to prevent table overflow
    return String(text).substring(0, 80); // Reduced from 100 to 80 for better table fit
  };

  // Custom PDF export with selected columns, title, and period info
const exportCustomPdf = async () => {
    setPdfModalOpen(false);

    setTimeout(async () => {
    
  const normalize = s => String(s || '').toLowerCase();
  let projectDetails = [];
  let projectDetailsFY = [];

  try {
    const projectResponse = await getProjectDetailsList({ page: 1, limit: 1000 });
    const allProjectsRaw = projectResponse?.data || [];

    const allProjectsByDir = selectedDirectorateTender !== 'All'
      ? allProjectsRaw.filter(project => project.directrate === selectedDirectorateTender)
      : allProjectsRaw;

    if (startDate && endDate) {
      const sd = dayjs(startDate).startOf('day').valueOf();
      const ed = dayjs(endDate).endOf('day').valueOf();
      projectDetails = allProjectsByDir.filter(project => {
        const projectDate = project.createdAt ? dayjs(project.createdAt).valueOf() : null;
        return projectDate && projectDate >= sd && projectDate <= ed;
      });
    } else {
      projectDetails = allProjectsByDir;
    }

    if (selectedFY && selectedFY !== 'All') {
      const fyMatch = selectedFY.match(/FY-(\d+)-(\d+)/);
      if (fyMatch) {
        const fyStartYear = parseInt(fyMatch[1], 10);
        const fyEndYear = parseInt(fyMatch[2], 10);
        const fyStart = dayjs(`${fyStartYear}-04-01`).startOf('day').valueOf();
        const fyEnd = dayjs(`${fyEndYear}-03-31`).endOf('day').valueOf();
        projectDetailsFY = allProjectsByDir.filter(project => {
          const projectDate = project.createdAt ? dayjs(project.createdAt).valueOf() : null;
          return projectDate && projectDate >= fyStart && projectDate <= fyEnd;
        });
      } else {
        projectDetailsFY = allProjectsByDir;
      }
    } else {
      projectDetailsFY = allProjectsByDir;
    }
  } catch (error) {
    console.error('Error fetching project details:', error);
  }

  // --- FY Summary ---
  let fyTotalTenders = 0, fyUploadCount = 0, fyBiddingCount = 0, fyNotBiddingCount = 0;
  if (selectedFY && selectedFY !== 'All') {
    const fyMatch = selectedFY.match(/FY-(\d+)-(\d+)/);
    if (fyMatch) {
      const fyStartYear = parseInt(fyMatch[1], 10);
      const fyEndYear = parseInt(fyMatch[2], 10);

      const fyTenders = filteredRows.filter(t => {
        if (!t.lastDate) return false;
        const date = new Date(t.lastDate);
        const month = date.getMonth();
        const year = date.getFullYear();
        const tenderFYStart = month < 3 ? year - 1 : year;
        const tenderFYEnd = tenderFYStart + 1;
        return tenderFYStart === fyStartYear && tenderFYEnd === fyEndYear;
      });

      fyTotalTenders = fyTenders.length;
      fyUploadCount = fyTenders.filter(t => {
        const st = normalize(t.status);
        return st.includes('not submit') || st.includes('not submitted') || st.includes('upload');
      }).length;
      fyBiddingCount = fyTenders.filter(t => {
        const st = normalize(t.status);
        return st.includes('submitted') || st.includes('under evaluation') || st.includes('bidding') || st.includes('in progress');
      }).length;
      fyNotBiddingCount = fyTenders.filter(t => {
        const st = normalize(t.status);
        return st.includes('not bidding') || st.includes('not-bidding') || st.includes('no bid') || st.includes('not bid');
      }).length;
    }
  }

  // --- Period Summary ---
  const periodTotalTenders = currentSummary?.total || 0;
  const periodUploadCount = currentSummary?.upload || 0;
  const periodBiddingCount = currentSummary?.bidding || 0;
  const periodNotBiddingCount = currentSummary?.notBidding || 0;

  // --- Project Summary ---
  const calcProjectStats = (projects) => {
    const totalProjects = projects.length;
    const totalValue = projects.reduce((sum, p) => sum + (Number(p.projectValue) || 0), 0);
    const completed = projects.filter(p => {
      const st = normalize(p.status);
      return st.includes('completed') || st.includes('closed') || st.includes('done');
    }).length;
    const ongoing = projects.filter(p => {
      const st = normalize(p.status);
      return st.includes('ongoing') || st.includes('in progress') || st.includes('active');
    }).length;
    return { totalProjects, totalValue, completed, ongoing };
  };

  const statsFY = calcProjectStats(projectDetailsFY);
  const statsPeriod = calcProjectStats(projectDetails);

  // --- Build Table Rows ---
  const selectedTenderCols = tenderCols.filter(col => selectedPdfCols.includes(col.field));
  const selectedProjCols = projectCols.filter(col => selectedProjectPdfCols.includes(col.field));

  const salesDataRows = filteredRows.map((row, idx) => {
    const cells = selectedTenderCols.map(col => {
      if (col.field === 'lastDate' && row[col.field]) return dayjs(row[col.field]).format('YYYY-MM-DD');
      if (col.field === 'valueINR') return (Number(row.valueINR || 0) / 100000).toFixed(2) + ' Lakhs';
      return String(row[col.field] || 'N/A').substring(0, 80);
    });
    return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
  }).join('');

  const projectDataRows = projectDetails.map((project, idx) => {
    const cells = selectedProjCols.map(col => {
      let value = project[col.field];
      if (col.field === 'startDate' || col.field === 'endDate') value = value ? dayjs(value).format('DD/MM/YYYY') : 'N/A';
      if (col.field === 'projectValue') value = value ? `₹${(Number(value) / 100000).toFixed(2)} Lakhs` : 'N/A';
      return `<td>${String(value || 'N/A').substring(0, 80)}</td>`;
    });
    return `<tr><td>${idx + 1}</td>${cells.join('')}</tr>`;
  }).join('');

  // --- Header Text ---
  let headerText = selectedDirectorateTender !== 'All' ? `${selectedDirectorateTender} - ` : 'All Directorates';
  if (startDate || endDate) {
    const startStr = startDate ? dayjs(startDate).format('DD/MM/YYYY') : 'N/A';
    const endStr = endDate ? dayjs(endDate).format('DD/MM/YYYY') : 'N/A';
    headerText += ` Report for Period: ${startStr} to ${endStr}`;
  }

  const startStr = startDate ? dayjs(startDate).format('DD/MM/YYYY') : 'N/A';
  const endStr = endDate ? dayjs(endDate).format('DD/MM/YYYY') : 'N/A';

 const htmlContent = `
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { font-size: 16px; font-weight: bold; margin-bottom: 10px; }
    h2 { font-size: 14px; font-weight: bold; margin-top: 15px; margin-bottom: 8px; }
    h3 { font-size: 12px; font-weight: bold; margin-bottom: 6px; margin-top: 0; }
    p { font-size: 12px; margin: 5px 0; }
    .summary-container { display: flex; gap: 50px; margin-top: 10px; margin-bottom: 15px; margin-left:100px; }
    .summary-column { flex: 1; }
    .summary-column p { font-size: 11px; margin: 4px 0; }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 11px;
      page-break-inside: auto; /* allow table to break across pages */
    }

    thead {
      display: table-header-group; /* repeat headers on each page */
    }

    tbody {
      display: table-row-group;
    }

    tr {
      page-break-inside: avoid; /* prevent splitting row */
      page-break-after: auto;
    }

    th, td {
      padding: 6px;
      border: 1px solid #ddd;
      word-break: break-word; /* wrap long content */
      white-space: normal;   /* allow multi-line text */
    }

    th {
      background-color: #1E90FF;
      color: white;
      text-align: left;
    }

    tr:nth-child(even) { background-color: #f9f9f9; }
  </style>
</head>
<body>
  <h1>${headerText}</h1>

  <h2>(1) Summary</h2>
  <div>
    <h3 style="margin-top: 10px; margin-left:50px; color: #1E90FF; text-align: left;">1. Sales Tracking</h3>
    <div class="summary-container">
      <div class="summary-column">
        <p><strong>Financial Year: ${selectedFY}</strong></p>
        <p>Total Tenders: ${fyTotalTenders}</p>
        <p>Upload / Bidding: ${fyUploadCount} / ${fyBiddingCount}</p>
        <p>Not Bidding: ${fyNotBiddingCount}</p>
      </div>
      <div class="summary-column">
        <p><strong>Period: ${startStr}-${endStr}</strong></p>
        <p>Total Tenders: ${periodTotalTenders}</p>
        <p>Upload / Bidding: ${periodUploadCount} / ${periodBiddingCount}</p>
        <p>Not Bidding: ${periodNotBiddingCount}</p>
      </div>
    </div>

    <h3 style="margin-top: 15px; margin-left:50px; color: #1E90FF; text-align: left;">2. Project</h3>
    <div class="summary-container">
      <div class="summary-column">
        <p><strong>Total Projects:</strong> ${statsFY.totalProjects}</p>
        <p><strong>Total Value:</strong> ₹${(statsFY.totalValue / 100000).toFixed(2)} Lakhs</p>
        <p><strong>Completed:</strong> ${statsFY.completed}</p>
        <p><strong>Ongoing:</strong> ${statsFY.ongoing}</p>
      </div>
      <div class="summary-column">
        <p><strong>Total Projects:</strong> ${statsPeriod.totalProjects}</p>
        <p><strong>Total Value:</strong> ₹${(statsPeriod.totalValue / 100000).toFixed(2)} Lakhs</p>
        <p><strong>Completed:</strong> ${statsPeriod.completed}</p>
        <p><strong>Ongoing:</strong> ${statsPeriod.ongoing}</p>
      </div>
    </div>
  </div>

  <h2>(2) Sales Data Added in This Period</h2>
  <table>
    <thead>
      <tr>${selectedTenderCols.map(col => `<th>${col.headerName}</th>`).join('')}</tr>
    </thead>
    <tbody>${salesDataRows}</tbody>
  </table>

  <h2>(3) Project Data Added in This Period</h2>
  <table>
    <thead>
      <tr>
        <th>S.No</th>
        ${selectedProjCols.map(col => `<th>${col.headerName}</th>`).join('')}
      </tr>
    </thead>
    <tbody>${projectDataRows}</tbody>
  </table>

  <div style="text-align: left; margin-top: 18px; font-size: 12px;">
    <span style="color: red;">*</span>For more details refer to PMC Portal
  </div>
</body>
</html>
`;

  const filename = selectedDirectorateTender !== 'All'
    ? `${selectedDirectorateTender}_Tender_Report_${dayjs().format('YYYY-MM-DD')}`
    : `All_Directorates_Tender_Report_${dayjs().format('YYYY-MM-DD')}`;

  const opt = {
    margin: 10,
    filename: `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
  };

  await html2pdf().set(opt).from(htmlContent).save();
  }, 50);

};

  // --- Data Fetching (UPDATED to include FY and Directorate filters) ---
  const fetchTenderData = async (yearFilter = "All", directorateFilter = "All") => {
    setLoading(true);
    try {
      const tenderResponse = await getAllTenderList({ isDeleted: false });
      let tenderData = tenderResponse?.data || [];
      
      // APPLY DIRECTORATE FILTER
      if (directorateFilter !== "All") {
        tenderData = tenderData.filter(t => t.directrate === directorateFilter);
      }

      // APPLY FINANCIAL YEAR FILTER
      if (yearFilter !== "All") {
        tenderData = tenderData.filter((t) => {
          if (!t.lastDate) return false;
          const date = new Date(t.lastDate);
          const month = date.getMonth();
          const year = date.getFullYear();
          const fyStartYear = month < 3 ? year - 1 : year;
          const fyEndYear = fyStartYear + 1;
          const fyLabel = `FY-${fyStartYear}-${fyEndYear}`;
          return fyLabel === yearFilter;
        });
      }

      // APPLY START / END DATE FILTER if provided
      try {
        const sd = startDate ? dayjs(startDate).startOf('day') : null;
        const ed = endDate ? dayjs(endDate).endOf('day') : null;
        if (sd) {
          tenderData = tenderData.filter(t => t.lastDate && dayjs(t.lastDate).valueOf() >= sd.valueOf());
        }
        if (ed) {
          tenderData = tenderData.filter(t => t.lastDate && dayjs(t.lastDate).valueOf() <= ed.valueOf());
        }
      } catch (errDateFilter) {
        console.warn('Date range filtering skipped due to invalid dates', errDateFilter);
      }

      const processedTenderRows = tenderData.map((r, i) => ({
        id: r?._id || i + 1,
        sno: i + 1,
        ...r,
      }));
      setTendereRows(processedTenderRows);
      
      // Calculate dropdown options from ALL tenders (before any filter), not just filtered rows
      const allProcessedTenderRows = tenderResponse?.data?.map((r, i) => ({
        id: r?._id || i + 1,
        sno: i + 1,
        ...r,
      })) || [];
      const uniqueTenderDirectorates = Array.from(
  new Set(allProcessedTenderRows.map(t => t.directrate).filter(Boolean))
)
  .sort((a, b) => a.localeCompare(b)); // 👈 Sort alphabetically ascending

setDirectorateTenderOptions(uniqueTenderDirectorates);

      // --- STATS AND SIDEBAR CALCULATION (Use ALL unfiltered data, not just filtered rows) ---
      const dirMap = {};
      let totalValue = 0, submitted = 0, closedOrLost = 0;

      allProcessedTenderRows.forEach(t => {
        const dir = t.directrate || "Unknown";
        if (!dirMap[dir]) dirMap[dir] = { count: 0, value: 0, submitted: 0, closedOrLost: 0 };
        dirMap[dir].count += 1;
        
        const val = Number(t.valueINR) || 0;
        dirMap[dir].value += val;
        totalValue += val;

        const status = t.status ? t.status.toLowerCase() : '';

        if (status.includes("submitted") || status.includes("under evaluation")) {
            submitted += 1;
            dirMap[dir].submitted += 1;
        } else if (status.includes("lost") || status.includes("closed") || status.includes("cancelled")) {
            closedOrLost += 1;
            dirMap[dir].closedOrLost += 1;
        }
      });

      const dirArray = Object.keys(dirMap).map(key => ({
        directorate: key,
        count: dirMap[key].count,
        value: dirMap[key].value,
        submitted: dirMap[key].submitted,
        closedOrLost: dirMap[key].closedOrLost
      }));
      dirArray.sort((a, b) => b.value - a.value);
      setDirectorateTenderData(dirArray); 

      // --- Status counts for Upload / Bidding / Not Bidding ---
      const normalize = s => String(s || '').toLowerCase();
      const uploadCount = processedTenderRows.filter(t => normalize(t.status).includes('upload')).length;
      const biddingCount = processedTenderRows.filter(t => {
        const st = normalize(t.status);
        return st.includes('submitted') || st.includes('under evaluation') || st.includes('bidding') || st.includes('in progress');
      }).length;
      const notBiddingCount = processedTenderRows.filter(t => {
        const st = normalize(t.status);
        return st.includes('not bidding') || st.includes('not-bidding') || st.includes('no bid') || st.includes('not submit') || st.includes('not submitted');
      }).length;

      // set current summary box data
      setCurrentSummary({
        total: processedTenderRows.length,
        upload: uploadCount,
        bidding: biddingCount,
        notBidding: notBiddingCount
      });
      // ------------------------------------------

      // --- Deleted tenders: compute lost/win counts (optionally FY filtered) ---
      let deletedWin = 0;
      let deletedLost = 0;
      let deletedUpload = 0;
      let deletedBidding = 0;
      let deletedNotBidding = 0;
      let deletedData = []; // <-- declare here so it's available after try/catch
      try {
        const deletedResp = await getAllTenderList({ isDeleted: true });
        deletedData = deletedResp?.data || [];

        if (yearFilter !== "All") {
          deletedData = deletedData.filter((t) => {
            if (!t.lastDate) return false;
            const date = new Date(t.lastDate);
            const month = date.getMonth();
            const year = date.getFullYear();
            const fyStartYear = month < 3 ? year - 1 : year;
            const fyEndYear = fyStartYear + 1;
            const fyLabel = `FY-${fyStartYear}-${fyEndYear}`;
            return fyLabel === yearFilter;
          });
        }

        // deleted status counts
        deletedUpload = deletedData.filter(t => normalize(t.status).includes('upload')).length;
        deletedBidding = deletedData.filter(t => {
          const st = normalize(t.status);
          return st.includes('submitted') || st.includes('under evaluation') || st.includes('bidding') || st.includes('in progress');
        }).length;
        deletedNotBidding = deletedData.filter(t => {
          const st = normalize(t.status);
          return st.includes('not bidding') || st.includes('not-bidding') || st.includes('no bid') || st.includes('not submit') || st.includes('not submitted');
        }).length;

        deletedData.forEach(t => {
          // prefer messageStatus field (e.g. "WON"), fallback to status text heuristics
          const msg = String(t.messageStatus || '').toLowerCase();
          const st = String(t.status || '').toLowerCase();

          const isWinMsg = msg === 'won' || msg === 'win' || msg.includes('won') || msg.includes('award') || msg.includes('awarded') || msg.includes('accepted') || msg.includes('selected');
          const isLostMsg = msg === 'lost' || msg.includes('lost') || msg.includes('closed') || msg.includes('cancelled') || msg.includes('rejected');

          if (msg) {
            if (isWinMsg) deletedWin += 1;
            else if (isLostMsg) deletedLost += 1;
            else {
              // ambiguous messageStatus -> fall back to status
              if (st.includes('won') || st.includes('award') || st.includes('awarded')) deletedWin += 1;
              else if (st.includes('lost') || st.includes('closed') || st.includes('cancelled') || st.includes('rejected')) deletedLost += 1;
            }
          } else {
            // no messageStatus: use status text heuristics
            if (st.includes('won') || st.includes('award') || st.includes('awarded') || st.includes('accepted') || st.includes('selected')) {
              deletedWin += 1;
            } else if (st.includes('lost') || st.includes('closed') || st.includes('cancelled') || st.includes('rejected')) {
              deletedLost += 1;
            }
          }
        });
      } catch (errDel) {
        // eslint-disable-next-line no-console
        console.error('Deleted tenders fetch error', errDel);
      }
      // set deleted summary
      setDeletedSummary({
        total: deletedData.length,
        upload: deletedUpload,
        bidding: deletedBidding,
        notBidding: deletedNotBidding,
        won: deletedWin,
        lost: deletedLost
      });
      // ------------------------------------------

      // only keep primary summary cards (Total Tenders + Total Value)
      setStats([
        { title: "Total Tenders", value: processedTenderRows.length, icon: "📁" },
        { title: "Total Value", value: (totalValue / 1e5).toFixed(2) + " Lakhs", icon: "💰" },
      ]);
      // ------------------------------------------

      // --- CHART DATA CALCULATION (Uses the filtered data) ---
      const processedChartData = groupByFinancialYearTender(processedTenderRows);
      setChartData(processedChartData);
      // --------------------------------

    } catch (error) {
      console.error("Tender data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch data whenever any filter changes (Directorate, FY, start/end dates)
  useEffect(() => {
    fetchTenderData(selectedFY, selectedDirectorateTender);
  }, [selectedFY, selectedDirectorateTender, startDate, endDate]);
  // -----------------------
  
  // --- amCharts Logic (Same as before) ---
  useEffect(() => {
    if (!chartData.length) return;

    if (window.am4core && window.am4charts && window.am4themes_animated) {
      const core = window.am4core;
      const charts = window.am4charts;
      const animated = window.am4themes_animated;

      if (chartDivRef.current && !chartInstanceRef.current) {
        // ...am4core/am4charts setup...
        const chart = core.create(chartDivRef.current, charts.XYChart);
        chartInstanceRef.current = chart;

        // configure chart (data, axes, series, etc.)
        chart.data = chartData.map((item) => ({
          category: item.financialYear,
          value: item.Total,
        }));

        const categoryAxis = chart.xAxes.push(new charts.CategoryAxis());
        categoryAxis.dataFields.category = 'category';
        categoryAxis.renderer.minGridDistance = 30;
        categoryAxis.renderer.labels.template.fontSize = 12;
        categoryAxis.title.text = 'Financial Year'; 
        categoryAxis.title.dy = 10;
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.grid.template.strokeOpacity = 0.3;


        const valueAxis = chart.yAxes.push(new charts.ValueAxis());
        valueAxis.title.text = 'Tender Value (Lakhs INR)';
        valueAxis.renderer.grid.template.strokeOpacity = 0.3;


        const series = chart.series.push(new charts.ColumnSeries());
        series.dataFields.valueY = 'value';
        series.dataFields.categoryX = 'category';
        
        series.columns.template.fill = core.color("#ff9800"); 
        series.columns.template.strokeOpacity = 0;
        series.columns.template.width = core.percent(10); 
        series.columns.template.tooltipText = '{categoryX}: [bold]{valueY} Lakhs[/]';
        
        const labelBullet = series.bullets.push(new charts.LabelBullet());
        labelBullet.label.text = '{valueY} Lakhs';
        labelBullet.label.fontSize = 12;
        labelBullet.label.fontWeight = 'normal';
        labelBullet.label.fill = core.color('#000');
        labelBullet.label.dy = -10;
        labelBullet.label.horizontalCenter = 'middle';
        
        return () => {
          if (chartInstanceRef.current) {
            chartInstanceRef.current.dispose();
            chartInstanceRef.current = null;
          }
        };
      } else {
        console.error('amCharts library not loaded.');
      }
    }
  }, [chartData]);
  // ----------------------
  
  // --- Filtering Logic (Same as before) ---
  let filteredRows = tenderRows;
  
  if (selectedDirectorateTender !== "All") {
    filteredRows = filteredRows.filter(
      (row) => row.directrate === selectedDirectorateTender
    );
  }
  
  filteredRows = getFilteredRows(filteredRows, search);
  // -----------------------

  return (
    <>
      {/* All Filters in Single Line */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        
        {/* Directorate Filter */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <label><b>Directorate:</b></label>
          <select
            value={selectedDirectorateTender}
            onChange={(e) => setSelectedDirectorateTender(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "6px", minWidth: "150px" }}
          >
            <option value="All">All</option>
            {directorateTenderOptions.map((dir, i) => (
              <option key={i} value={dir}>{dir}</option>
            ))}
          </select>
        </Box>

        {/* Financial Year Dropdown */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <label><b>Financial Year:</b></label>
          <select
            value={selectedFY}
            onChange={(e) => setSelectedFY(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "6px", minWidth: "120px" }}
          >
            {/* Ensure FYs exist before rendering */}
            {financialYears.length > 0 && 
              [financialYears[0], ...financialYears.slice(1).reverse()].map((fy, i) => (
                <option key={i} value={fy}>{fy}</option>
              ))}
          </select>
        </Box>

        {/* Start Date Picker */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => handleStartDateChange(newValue)}
            format="DD/MM/YYYY"
            maxDate={endDate ? dayjs(endDate) : undefined}
            slotProps={{ textField: { size: "small", error: !!dateError && startDate && endDate && dayjs(endDate).isBefore(dayjs(startDate), 'day'), helperText: (!!dateError && startDate && endDate && dayjs(endDate).isBefore(dayjs(startDate), 'day')) ? dateError : '' } }}
          />
          {startDate && (
            <Button
              size="small"
              variant="outlined"
              color='error'
              onClick={() => handleStartDateChange(null)}
              sx={{ minWidth: 40, height: 40, p: 0 }}
            >
              ✕
            </Button>
          )}
        </Box>

        {/* End Date Picker */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => handleEndDateChange(newValue)}
            format="DD/MM/YYYY"
            minDate={startDate ? dayjs(startDate) : undefined}
            slotProps={{ textField: { size: "small", error: !!dateError && startDate && endDate && dayjs(endDate).isBefore(dayjs(startDate), 'day'), helperText: (!!dateError && startDate && endDate && dayjs(endDate).isBefore(dayjs(startDate), 'day')) ? dateError : '' } }}
          />
          {endDate && (
            <Button
              size="small"
              variant="outlined"
              color='error'
              onClick={() => handleEndDateChange(null)}
              sx={{ minWidth: 40, height: 40, p: 0 }}
            >
              ✕
            </Button>
          )}
        </Box>

        {/* Date Error Message */}
        {dateError && (
          <Typography color="error" variant="caption">
            {dateError}
          </Typography>
        )}
      </Box>
        <DialogContent sx={{ pt: 2 }}>
          {/* Report Info Box: Directorate */}
         <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1, 
            mb: 2 
            }}>

            {/* Directorate Box */}
            <Box sx={{ 
                px: 1.5, py: 0.8, 
                backgroundColor: '#fff3e0', 
                borderRadius: 1, 
                border: '1px solid #ffe0b2', 
                minWidth: 150 
            }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#e65100' }}>
                Directorate:
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.3, color: '#bf360c' }}>
                {selectedDirectorateTender !== 'All' ? selectedDirectorateTender : 'All Directorates'}
                </Typography>
            </Box>
            <Box sx={{ 
                px: 1.5, py: 0.8, 
                backgroundColor: '#fff3e0', 
                borderRadius: 1, 
                border: '1px solid #ffe0b2', 
                minWidth: 150 
            }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#e65100' }}>
                Financial Year  :
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.3, color: '#bf360c' }}>
                {selectedFY !== 'All' ? selectedFY : 'All Financial Years'}
                </Typography>
            </Box>

            {/* Period Box */}
            {(startDate || endDate) && (
                <Box sx={{ 
                px: 1.5, py: 0.8, 
                backgroundColor: '#e3f2fd', 
                borderRadius: 1, 
                border: '1px solid #bbdefb', 
                minWidth: 180 
                }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Period:
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.3, color: '#1565c0' }}>
                    {startDate ? dayjs(startDate).format('DD/MM/YYYY') : 'N/A'} to {endDate ? dayjs(endDate).format('DD/MM/YYYY') : 'N/A'}
                </Typography>
                </Box>
            )}

            {/* Validation Message */}
            {( !startDate || !endDate ) && (
                <Box sx={{ 
                px: 1.5, py: 0.8, 
                backgroundColor: '#ffebee', 
                borderRadius: 1, 
                border: '1px solid #ffcdd2', 
                minWidth: 250 
                }}>
                <Typography variant="caption" sx={{ color: '#c62828' }}>
                    ⚠️ Please select , <strong>Start Date</strong>, and <strong>End Date</strong> to download PDF.
                </Typography>
                </Box>
            )}

            </Box>

        <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
            Select Columns of Sales Tracking to Include:
            </Typography>
            <FormGroup
            sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', // responsive columns
                gap: 1
            }}
            >
            {tenderCols.map((col) => (
                <FormControlLabel
                key={col.field}
                control={
                    <Checkbox
                    checked={selectedPdfCols.includes(col.field)}
                    onChange={(e) => {
                        if (e.target.checked) {
                        setSelectedPdfCols([...selectedPdfCols, col.field]);
                        } else {
                        setSelectedPdfCols(selectedPdfCols.filter(f => f !== col.field));
                        }
                    }}
                    />
                }
                label={col.headerName}
                />
            ))}
            </FormGroup>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
            Selected Columns: {selectedPdfCols.length} / {tenderCols.length}
            </Typography>

            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
            Select Columns of Projects to Include:
            </Typography>
            <FormGroup
            sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', // responsive columns
                gap: 1,
                mt: 1
            }}
            >
            {projectCols.map((col) => (
                <FormControlLabel
                key={col.field}
                control={
                    <Checkbox
                    checked={selectedProjectPdfCols.includes(col.field)}
                    onChange={(e) => {
                        if (e.target.checked) {
                        setSelectedProjectPdfCols([...selectedProjectPdfCols, col.field]);
                        } else {
                        setSelectedProjectPdfCols(selectedProjectPdfCols.filter(f => f !== col.field));
                        }
                    }}
                    />
                }
                label={col.headerName}
                />
            ))}
            </FormGroup>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
            Selected Columns: {selectedProjectPdfCols.length} / {projectCols.length}
            </Typography>
        </DialogContent>
        <DialogActions>
          {/* <Button onClick={() => setPdfModalOpen(false)} color="inherit">
            Cancel
          </Button> */}
          <Button
            onClick={exportCustomPdf}
            variant="contained"
            color="primary"
             disabled={
                (selectedPdfCols.length === 0 && selectedProjectPdfCols.length === 0) || // no columns selected
                !startDate || // start date missing
                !endDate   
            }
          >
            Download PDF
          </Button>
         </DialogActions> 
      {/* </Dialog> */}
    </>
  );
}