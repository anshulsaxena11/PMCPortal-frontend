// ProjectsDashboard.jsx

/* global am4core, am4charts, am4themes_animated */
import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, TextField, Stack, Tooltip, Paper, Button } from '@mui/material';
import { Card } from "react-bootstrap";
import CustomDataGrid from '../../components/DataGrid/CustomDataGrid';
import { getProjectDetailsList } from '../../api/ProjectDetailsAPI/projectDetailsApi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// --- DataGrid Columns (Moved to child component) ---
const workTypeCols = [
  { field: 'sno', headerName: 'S. No.', width: 60, sortable: false, filterable: false },
  { field: 'orginisationName', headerName: 'Organisation Name', flex: 1.5 },
  { field: 'type', headerName: 'Org Type', flex: 1 },
  { field: 'orderType', headerName: 'Order Type', flex: 1 },
  { field: 'projectName', headerName: 'Project Name', flex: 1 },
  { field: 'typeOfWork', headerName: 'Type Of Work', flex: 1 },
  {
    field: "amountStatus",
    headerName: "Status",
    width: 120,
    renderCell: (params) => params.value || "N/A", 
  },
  {
    field: "directrate",
    headerName: "Directorate",
    flex: 1,
    renderCell: (params) => params.value || "N/A", 
  },
  {
    field: 'projectValue',
    headerName: 'Project Value (Lakhs INR)',
    flex: 1,
    align: 'right',
    renderCell: (params) => {
      const val = params?.row?.projectValue;
      if (!val || isNaN(val)) return 'N/A';
      const croreValue = Number(val) / 100000;
      const formattedCr = croreValue.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const fullValue = 'Rs. ' + Number(val).toLocaleString('en-IN');
      return (
        <Tooltip title={fullValue}>
          <span>{formattedCr} Lakhs</span>
        </Tooltip>
      );
    },
  },
];
// ----------------------------------------------------

// --- Utility Functions (Moved to child component) ---
function groupByFinancialYear(data) {
    const yearMap = {};

    data.forEach((project) => {
        const { startDate, projectValue, projectValueYearly } = project;

        // ✅ CASE 1: If projectValueYearly exists and not empty
        if (Array.isArray(projectValueYearly) && projectValueYearly.length > 0) {
            projectValueYearly.forEach(({ financialYear, amount }) => {
                if (!financialYear || !amount) return;
                const value = parseFloat(amount || "0");
                const fyLabel = `FY-${financialYear}`;
                const fyStartYear = parseInt(financialYear.split("-")[0]);

                if (!yearMap[fyLabel]) {
                    yearMap[fyLabel] = { financialYear: fyLabel, Total: 0, startYear: fyStartYear };
                }
                yearMap[fyLabel].Total += value;
            });
        } 
        
        // ✅ CASE 2: Fallback to projectValue + startDate
        else if (startDate) {
            const date = new Date(startDate);
            const month = date.getMonth();
            const year = date.getFullYear();
            const fyStartYear = month < 3 ? year - 1 : year;
            const fyEndYear = fyStartYear + 1;
            const fyLabel = `FY-${fyStartYear}-${fyEndYear}`;
            const value = parseFloat(projectValue || "0");

            if (!yearMap[fyLabel]) {
                yearMap[fyLabel] = { financialYear: fyLabel, Total: 0, startYear: fyStartYear };
            }
            yearMap[fyLabel].Total += value;
        }
    });

    // ✅ Format result: convert to lakhs and sort by year
    return Object.values(yearMap)
        .map(({ financialYear, Total, startYear }) => ({
            financialYear,
            Total: +(Total / 100000).toFixed(2),
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


export default function ProjectsDashboard() {
  // ---- Export helpers ----
  const exportToCsv = (rows, filename = 'projects') => {
    const headers = workTypeCols.map(c => c.headerName);
    const csvRows = rows.map(row =>
      workTypeCols.map(col => {
        let v = row[col.field];
        if (col.field === 'projectValue') v = Number(v || 0);
        if (col.field === 'startDate' || col.field === 'endDate') {
          v = row[col.field] ? new Date(row[col.field]).toLocaleDateString() : '';
        }
        return `"${String(v ?? '').replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csv = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPdf = (rows, filename = 'projects') => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const headers = [workTypeCols.map(c => c.headerName)];
    const body = rows.map(row =>
      workTypeCols.map(col => {
        let v = row[col.field];
        if (col.field === 'projectValue') {
          const val = Number(v || 0);
          v = isNaN(val) ? 'N/A' : `Rs. ${val.toLocaleString('en-IN')}`;
        }
        if (col.field === 'startDate' || col.field === 'endDate') v = row[col.field] ? new Date(row[col.field]).toLocaleDateString() : '';
        return String(v ?? '');
      })
    );
    doc.autoTable({ head: headers, body, startY: 14, styles: { fontSize: 8 } });
    doc.save(`${filename}.pdf`);
  };
  // -------------------------
   // --- State ---
   const [search, setSearch] = useState('');
   const [workTypeRows, setWorkTypeRows] = useState([]);
   const [chartData, setChartData] = useState([]);
   const [loading, setLoading] = useState(false);
   const [page, setPage] = useState(0);
   const [pageSize, setPageSize] = useState(10);
   const [directorateData, setDirectorateData] = useState([]); 
   const [selectedDirectorateProject, setSelectedDirectorateProject] = useState("All"); 
   const [selectedFY, setSelectedFY] = useState("All");
   const [financialYears, setFinancialYears] = useState([]); // Initialized as []
   const [stats, setStats] = useState([]);
   const chartRef = useRef(null);
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

   // --- Data Fetching ---
   const fetchProjectData = async (yearFilter = "All") => {
     setLoading(true);
     try {
       const workTypeResponse = await getProjectDetailsList({ page: 1, limit: 10000, isDeleted: false });
       let projectsData = workTypeResponse?.data || [];

       if (yearFilter !== "All") {
         projectsData = projectsData.filter((p) => {
           if (!p.startDate) return false;
           const date = new Date(p.startDate);
           const month = date.getMonth();
           const year = date.getFullYear();
           const fyStartYear = month < 3 ? year - 1 : year;
           const fyEndYear = fyStartYear + 1;
           const fyLabel = `FY-${fyStartYear}-${fyEndYear}`;
           return fyLabel === yearFilter;
         });
       }

       // Projects Data Processing
       const dirMap = {};
       let totalValue = 0, completed = 0, ongoing = 0;
       projectsData.forEach(p => {
         const dir = p.directrate || "Unknown";
         if (!dirMap[dir]) dirMap[dir] = { count: 0, value: 0, completed: 0, ongoing: 0 };
         dirMap[dir].count += 1;
         const val = Number(p.projectValue) || 0;
         dirMap[dir].value += val;
         totalValue += val;
         const isComplete = p.phases?.length > 0 && p.phases.every(ph => ph.amountStatus === "Complete");
         if (isComplete) {
           completed += 1;
           dirMap[dir].completed += 1;
         } else {
           ongoing += 1;
           dirMap[dir].ongoing += 1;
         }
       });

       const dirArray = Object.keys(dirMap).map(key => ({
         directorate: key,
         count: dirMap[key].count,
         value: dirMap[key].value,
         completed: dirMap[key].completed,
         ongoing: dirMap[key].ongoing
       }));
       dirArray.sort((a, b) => b.value - a.value);
       setDirectorateData(dirArray); 

       setStats([
         { title: "Total Projects", value: projectsData.length, icon: "📁" },
         { title: "Total Value", value: (totalValue / 100000).toFixed(2) + " Lakhs", icon: "💰" },
         { title: "Completed", value: completed, icon: "✅" },
         { title: "Ongoing", value: ongoing, icon: "⏳" }
       ]);

       const processedChartData = groupByFinancialYear(projectsData);
       setChartData(processedChartData);

       setWorkTypeRows(projectsData.map((item, index) => {
         const amountStatus = Array.isArray(item.phases) && item.phases.length > 0
           ? item.phases[0].amountStatus || "N/A"
           : "Ongoing";

         return {
           id: item?._id || index + 1,
           sno: index + 1,
           ...item,
           amountStatus, 
         };
       }));

     } catch (error) {
       console.error("Project data fetch error:", error);
     } finally {
       setLoading(false);
     }
   };

   useEffect(() => {
     // Reset directorate filter when FY changes
     setSelectedDirectorateProject("All"); 
     fetchProjectData(selectedFY);
   }, [selectedFY]);
   // -------------------------------------------
   
   // --- Filtering Logic ---
   let filteredRows = workTypeRows;
   
   if (selectedDirectorateProject !== "All") {
     filteredRows = filteredRows.filter(
       (row) => row.directrate === selectedDirectorateProject
     );
   }
   
   filteredRows = getFilteredRows(filteredRows, search);
   // -----------------------

   // --- amCharts Logic ---
   useEffect(() => {
     if (!chartData.length) return;

     if (window.am4core && window.am4charts && window.am4themes_animated) {
       const core = window.am4core;
       const charts = window.am4charts;
       const animated = window.am4themes_animated;

       if (chartRef.current) {
         chartRef.current.dispose();
         chartRef.current = null;
       }

       core.useTheme(animated);
       const chart = core.create('chartdiv', charts.XYChart);
       chartRef.current = chart;

       chart.data = chartData.map((item) => ({
         category: item.financialYear,
         value: item.Total,
       }));

       const categoryAxis = chart.xAxes.push(new charts.CategoryAxis());
       categoryAxis.dataFields.category = 'category';
       categoryAxis.title.text = 'Financial Year';

       const valueAxis = chart.yAxes.push(new charts.ValueAxis());
       valueAxis.title.text = 'Project Value (Lakhs INR)';

       const series = chart.series.push(new charts.ColumnSeries());
       series.dataFields.valueY = 'value';
       series.dataFields.categoryX = 'category';
       series.columns.template.width = 50;
       const labelBullet = series.bullets.push(new charts.LabelBullet());
       labelBullet.label.text = '{valueY} Lakhs';
       labelBullet.label.fontSize = 12;
       labelBullet.label.fontWeight = '600';
       labelBullet.label.fill = core.color('#000');
       labelBullet.label.dy = -5;
       labelBullet.label.horizontalCenter = 'middle';
       series.name = 'Project Value';
       series.columns.template.tooltipText = '{categoryX}: [bold]{valueY} Lakhs[/]';
       
       return () => {
         if (chartRef.current) {
           chartRef.current.dispose();
           chartRef.current = null;
         }
       };
     } else {
       console.error('amCharts library not loaded.');
     }
   }, [chartData]);
   // ----------------------

   return (
     <>
       <Box sx={{ mb: 2 }}>
         <label><b>Financial Year:</b></label>{" "}
         <select
           value={selectedFY}
           onChange={(e) => setSelectedFY(e.target.value)}
           style={{ padding: "6px 10px", borderRadius: "6px" }}
         >
           {/* CRITICAL FIX: Ensure financialYears is not empty before attempting to access [0] */}
           {financialYears.length > 0 && 
             [financialYears[0], ...financialYears.slice(1).reverse()].map((fy, i) => (
               <option key={i} value={fy}>{fy}</option>
             ))}
         </select>
       </Box>

       <div className="dashboard-wrapper">
         <aside className="left-sidebar">
           <h5 className="left-title">Directorate Wise Projects</h5>
           <div className="left-scroll">
             <Card 
               className="mb-2 left-item" 
               onClick={() => setSelectedDirectorateProject("All")} 
               style={{ cursor: 'pointer', background: selectedDirectorateProject === "All" ? '#e0f7fa' : 'white' }}
             >
               <Card.Body className="py-2 px-3">
                 <div className="d-flex justify-content-between align-items-center">
                   <div className="small"><strong>All Directorates ({workTypeRows.length})</strong></div>
                 </div>
               </Card.Body>
             </Card>
             {directorateData.map((d, i) => (
               <Card 
                 key={i} 
                 className="mb-2 left-item" 
                 onClick={() => setSelectedDirectorateProject(d.directorate)}
                 style={{ cursor: 'pointer', background: selectedDirectorateProject === d.directorate ? '#e0f7fa' : 'white' }}
               >
                 <Card.Body className="py-2 px-3">
                   <div className="d-flex justify-content-between align-items-center">
                     <div className="small"><strong>{d.directorate}</strong></div>
                     <div className="text-end">
                       <div className="fw-bold">{d.count} Projects</div>
                       <div className="small">Value: {(d.value / 100000).toFixed(2)} Lakhs</div>
                     </div>
                   </div>
                   <div className="mt-1 d-flex justify-content-between small">
                     <span>Completed: {d.completed}</span>
                     <span>Ongoing: {d.ongoing}</span>
                   </div>
                 </Card.Body>
               </Card>
             ))}
           </div>
         </aside>

         <main className="right-content">
           <h5 className="mb-3">Projects Overview</h5> 
           <div className="stats-grid">
             {stats.map((s, i) => (
               <Card key={i} className="stat-card">
                 <div className={`stat-header`}>
                   {s.title}
                 </div>
                 <div className="stat-content">
                   <div className={`stat-value`}>{s.value}</div>
                 </div>
               </Card>
             ))}
           </div>
         </main>
       </div>
       
       {/* Chart */}
       <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
         Project Value Overview (Lakhs INR)
       </Typography>
       <Box id="chartdiv" sx={{ width: '100%', height: 300 }} />

       <Stack direction="row" spacing={2} my={2} alignItems="center" flexWrap="wrap">
         <Box>
           <label><b>Directorate Filter:</b></label>{" "}
           <select
             value={selectedDirectorateProject}
             onChange={(e) => setSelectedDirectorateProject(e.target.value)}
             style={{ padding: "6px 10px", borderRadius: "6px", minWidth: "200px" }}
           >
             <option value="All">All ({workTypeRows.length})</option>
             {Array.from(new Set(directorateData.map(d => d.directorate))).map((dir, i) => (
               <option key={i} value={dir}>{dir}</option>
             ))}
           </select>
         </Box>
         <TextField
           label="Search..."
           variant="outlined"
           value={search}
           size="small"
           onChange={(e) => setSearch(e.target.value)}
           sx={{
             width: 250,
             backgroundColor: 'white',
             '& .MuiInputBase-root': { height: 40 },
             flexGrow: 1,
           }}
         />
         <Box sx={{ display: 'flex', gap: 1 }}>
           <Button
             variant="contained"
             color="secondary"
             size="small"
             onClick={() => exportToPdf(filteredRows, `Projects_${new Date().toISOString().slice(0,10)}`)}
             sx={{ minWidth: 140 }}
           >
             Download PDF
           </Button>
           <Button
             variant="contained"
             color="primary"
             size="small"
             onClick={() => exportToCsv(filteredRows, `Projects_${new Date().toISOString().slice(0,10)}`)}
             sx={{ minWidth: 140 }}
           >
             Download CSV
           </Button>
         </Box>
       </Stack>
       
       <Box sx={{ height: 400 }}>
         <CustomDataGrid
           rows={filteredRows.map((row, index) => ({...row, sno: index + 1}))} // Re-sequence S.No after filtering
           columns={workTypeCols}
           loading={loading}
           paginationModel={{ page, pageSize }}
           onPaginationModelChange={({ page, pageSize }) => {
             setPage(page);
             setPageSize(pageSize);
           }}
           rowCount={filteredRows.length}
           paginationMode="client"
           autoHeight
         />
       </Box>
     </>
   );
 }