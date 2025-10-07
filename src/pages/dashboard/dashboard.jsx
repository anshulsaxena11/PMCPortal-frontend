/* global am4core, am4charts, am4themes_animated */
import React, { useEffect, useState, useRef } from 'react';
import { Box, Paper, Typography, TextField, Button, Stack, Tooltip } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { Card } from "react-bootstrap";
import dayjs from 'dayjs';
import "./dashboard.css";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getProjectDetailsList } from '../../api/ProjectDetailsAPI/projectDetailsApi';
import { getAllTenderList } from '../../api/TenderTrackingAPI/tenderTrackingApi';
import CustomDataGrid from '../../components/DataGrid/CustomDataGrid';

const tabData = [
  { label: 'Projects', icon: <WorkIcon />, key: 'workType' },
  { label: 'Sales Tracking', icon: <RequestQuoteIcon />, key: 'tenderTracking' },
];


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
    renderCell: (params) => params.value || "N/A", // fallback just in case
  },
    { field: 'directrate', headerName: 'Directorate', flex: 1 },
    {
      field: 'projectValue',
      headerName: 'Project Value (Cr INR)',
      flex: 1,
      align: 'right',
      renderCell: (params) => {
        const val = params?.row?.projectValue;
        if (!val || isNaN(val)) return 'N/A';
        const croreValue = Number(val) / 10000000;
        const formattedCr = croreValue.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        const fullValue = 'Rs. ' + Number(val).toLocaleString('en-IN');
        return (
          <Tooltip title={fullValue}>
            <span>{formattedCr} Cr</span>
          </Tooltip>
        );
      },
    },
  ];

  const tenderCols = [
    { field: 'sno', headerName: 'S.No', width: 80 },
    { field: 'tenderName', headerName: 'Tender Name', flex: 1 },
    { field: 'organizationName', headerName: 'Organization Name', flex: 1 },
    //{ field: 'state', headerName: 'State', flex: 1 },
    { field: 'taskForce', headerName: 'Task Force', flex: 1 },
    { field: 'state', headerName: 'State', flex: 1 },
    {
              field: 'valueINR',
              headerName: 'Value (Cr INR)',
              flex: 1,
              align: 'right',
              renderCell: (params) => {
                const val = params?.row?.valueINR;
                if (!val || isNaN(val)) return 'N/A';
                const croreValue = Number(val) / 10000000;
                const formattedCr = croreValue.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
                const fullValue = 'Rs. ' + Number(val).toLocaleString('en-IN');
                return (
                  <Tooltip title={fullValue} INR>
                    <span>{formattedCr} Cr</span>
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



export default function TabCardWithGrids() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [workTypeRows, setWorkTypeRows] = useState([]);
  const [tenderRows, setTendereRows] = useState([]);
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [projects, setProjects] = useState([]);
  const [directorateData, setDirectorateData] = useState([]);
  const [selectedFY, setSelectedFY] = useState("All");
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedDirectorate, setSelectedDirectorate] = useState("All");
  const [selectedState, setSelectedState] = useState("All");


  const [stats, setStats] = useState([
    { title: "Total Projects", value: 0, icon: "📁" },
    { title: "Total Value", value: 0, icon: "💰" },
    { title: "Completed", value: 0, icon: "✅" },
    { title: "Ongoing", value: 0, icon: "⏳" }
  ]);

  // 📅 Generate FY options dynamically and include current FY
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

  // 📊 Group projects by FY for chart
  function groupByFinancialYear(data) {
    const yearMap = {};
    data.forEach((project) => {
      const { startDate, projectValue } = project;
      if (!startDate) return;
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
    });

    return Object.values(yearMap)
      .map(({ financialYear, Total, startYear }) => ({
        financialYear,
        Total: +(Total / 10000000).toFixed(2),
        startYear,
      }))
      .sort((a, b) => a.startYear - b.startYear)
      .map(({ financialYear, Total }) => ({ financialYear, Total }));
  }

  // 🔄 Fetch data (all)
  const fetchAllData = async (yearFilter = "All") => {
    setLoading(true);
    try {
      const workTypeResponse = await getProjectDetailsList({ page: 1, limit: 10000, isDeleted: false });
      const tenderResponse = await getAllTenderList({ isDeleted: false });

      let projectsData = workTypeResponse?.data || [];

      // 🎯 Filter by selected FY
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

      setProjects(projectsData);

      // 💼 Directorates Summary
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
      setDirectorateData(dirArray);

      setStats([
        { title: "Total Projects", value: projectsData.length, icon: "📁" },
        { title: "Total Value", value: (totalValue / 1e7).toFixed(2) + " Cr", icon: "💰" },
        { title: "Completed", value: completed, icon: "✅" },
        { title: "Ongoing", value: ongoing, icon: "⏳" }
      ]);

      // 💹 Chart data
      const processedChartData = groupByFinancialYear(projectsData);
      setChartData(processedChartData);

      // Grid data
      setWorkTypeRows(projectsData.map((item, index) => {
        const amountStatus = Array.isArray(item.phases) && item.phases.length > 0
          ? item.phases[0].amountStatus || "N/A"
          : "N/A";

        return {
          id: item?._id || index + 1,
          sno: index + 1,
          ...item,
          amountStatus, // set extracted value or N/A
        };
      }));

      setTendereRows((tenderResponse?.data || []).map((r, i) => ({
        id: r?._id || i + 1,
        sno: i + 1,
        ...r,
      })));

    } catch (error) {
      console.error("API fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData(selectedFY);
  }, [selectedFY]);

  // 🎨 Chart Rendering
  useEffect(() => {
    if (activeTab !== 0) return;
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
      valueAxis.title.text = 'Project Value (Cr INR)';

      const series = chart.series.push(new charts.ColumnSeries());
      series.dataFields.valueY = 'value';
      series.dataFields.categoryX = 'category';
      series.columns.template.width = 50;

      const labelBullet = series.bullets.push(new charts.LabelBullet());
      labelBullet.label.text = '{valueY} Cr';
      labelBullet.label.fontSize = 12;
      labelBullet.label.fontWeight = '600';
      labelBullet.label.fill = core.color('#000');
      labelBullet.label.dy = -5;
      labelBullet.label.horizontalCenter = 'middle';

      series.name = 'Project Value';
      series.columns.template.tooltipText = '{categoryX}: [bold]{valueY} Cr[/]';

      return () => {
        if (chartRef.current) {
          chartRef.current.dispose();
          chartRef.current = null;
        }
      };
    } else {
      console.error('amCharts library not loaded.');
    }
  }, [activeTab, chartData]);

  let filteredRows = getCurrentTabRows();

// 🎯 Filter by Directorate (Projects tab)
if (activeTab === 0 && selectedDirectorate !== "All") {
  filteredRows = filteredRows.filter(
    (row) => row.directrate === selectedDirectorate
  );
}

// 🏗️ Filter by State (Sales Tracking tab)
if (activeTab === 1 && selectedState !== "All") {
  filteredRows = filteredRows.filter(
    (row) => row.state === selectedState
  );
}

// 🔍 Apply text search
if (search.trim()) {
  filteredRows = getFilteredRows(filteredRows, search);
}



  function getCurrentTabRows() {
    return activeTab === 0 ? workTypeRows : tenderRows;
  }

  function getFilteredRows(rows, term) {
    const lower = term.toLowerCase().trim();
    return rows.filter((row) =>
      Object.values(row).some(
        (val) => String(val || "").toLowerCase().includes(lower)
      )
    );
  }

  return (
    <>
      {/* Tab Buttons */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        {tabData.map((tab, index) => (
          <Paper
            key={index}
            onClick={() => setActiveTab(index)}
            elevation={3}
            sx={{
              width: 200,
              height: 70,
              cursor: 'pointer',
              borderRadius: 3,
              px: 2,
              py: 1.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background:
                activeTab === index ? 'linear-gradient(to right, #2196f3, #21cbf3)' : '#f5f5f5',
              color: activeTab === index ? '#fff' : '#000',
              '&:hover': { boxShadow: 6 },
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              display="flex"
              alignItems="center"
              gap={1}
            >
              {tab.icon}
              {tab.label}
            </Typography>
          </Paper>
        ))}
      </Box>
{activeTab === 0 && (
  <>
    {/* FY Dropdown */}
    <Box sx={{ mb: 2 }}>
      <label><b>Financial Year:</b></label>{" "}
      <select
        value={selectedFY}
        onChange={(e) => setSelectedFY(e.target.value)}
        style={{ padding: "6px 10px", borderRadius: "6px" }}
      >
        {financialYears.map((fy, i) => (
          <option key={i} value={fy}>{fy}</option>
        ))}
      </select>
    </Box>

    {/* Left & Right sections */}
    <div className="dashboard-wrapper">
      <aside className="left-sidebar">
        <h5 className="left-title">Directorate Wise Projects</h5>
        <div className="left-scroll">
          {directorateData.map((d, i) => (
            <Card key={i} className="mb-2 left-item">
              <Card.Body className="py-2 px-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="small"><strong>{d.directorate}</strong></div>
                  <div className="text-end">
                    <div className="fw-bold">{d.count} Projects</div>
                    <div className="small">Value: {(d.value / 1e7).toFixed(2)} Cr</div>
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
  {/* The title "Projects Overview" should be replaced or removed for this new section */}
  <h5 className="mb-3">Analytics Dashboard</h5> 
  <div className="stats-grid">
    {stats.map((s, i) => (
      <Card key={i} className="stat-card">
        {/* New: The colored header section */}
        <div className={`stat-header ${s.headerClass}`}>
          {s.title}
        </div>
        {/* New: The white content section */}
        <div className="stat-content">
          {/* Note: The d-flex align-items-center is removed since there are no icons */}
          <div className={`stat-value ${s.valueClass}`}>{s.value}</div>
        </div>
      </Card>
    ))}
  </div>
</main>
    </div>

    {/* Chart */}
    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
      Project Value Overview (Cr INR)
    </Typography>
    <Box id="chartdiv" sx={{ width: '100%', height: 300 }} />
  </>
)}


  <Stack direction="row" spacing={2} mb={2} alignItems="center" flexWrap="wrap">
  {/* Directorate Dropdown — visible only for Projects tab */}
  {activeTab === 0 && (
    <Box>
      <label><b>Directorate:</b></label>{" "}
      <select
        value={selectedDirectorate}
        onChange={(e) => setSelectedDirectorate(e.target.value)}
        style={{ padding: "6px 10px", borderRadius: "6px", minWidth: "200px" }}
      >
        <option value="All">All</option>
        {Array.from(new Set(directorateData.map(d => d.directorate))).map((dir, i) => (
          <option key={i} value={dir}>{dir}</option>
        ))}
      </select>
    </Box>
  )}

  {/* State Dropdown — visible only for Sales Tracking tab */}
  {activeTab === 1 && (
    <Box>
      <label><b>State:</b></label>{" "}
      <select
        value={selectedState}
        onChange={(e) => setSelectedState(e.target.value)}
        style={{ padding: "6px 10px", borderRadius: "6px", minWidth: "200px" }}
      >
        <option value="All">All</option>
        {Array.from(new Set(tenderRows.map(t => t.state).filter(Boolean))).map((st, i) => (
          <option key={i} value={st}>{st}</option>
        ))}
      </select>
    </Box>
  )}

  {/* Search Box */}
  <TextField
    label="Search..."
    variant="outlined"
    value={search}
    size="small"
    onChange={(e) => setSearch(e.target.value)}
    sx={{
      mb: 2,
      width: 250,
      backgroundColor: 'white',
      '& .MuiInputBase-root': { height: 40 },
      flexGrow: 1,
    }}
  />

  {/* CSV Download */}
  <Button
    variant="contained"
    onClick={() => {
      const columns = activeTab === 0 ? workTypeCols : tenderCols;
      const rows = filteredRows;

      const headers = columns.map((col) => `"${col.headerName}"`).join(",");
      const data = rows.map((row) =>
        columns.map((col) => `"${row[col.field] ?? ''}"`).join(",")
      );
      const csvContent = [headers, ...data].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${tabData[activeTab].label.replace(/\s+/g, "_")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }}
  >
    Download CSV
  </Button>

  {/* PDF Download */}
  <Button
    variant="contained"
    color="secondary"
    onClick={() => {
      const doc = new jsPDF();
      const columns = (activeTab === 0 ? workTypeCols : tenderCols).map((col) => ({
        header: col.headerName,
        dataKey: col.field,
      }));
      const rows = filteredRows.map((row) => {
        const formatted = {};
        columns.forEach((col) => {
          formatted[col.dataKey] = row[col.dataKey] ?? "";
        });
        return formatted;
      });

      autoTable(doc, {
        columns,
        body: rows,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [33, 150, 243] },
      });
      doc.save(`${tabData[activeTab].label.replace(/\s+/g, "_")}.pdf`);
    }}
  >
    Download PDF
  </Button>
</Stack>




      <Box sx={{ height: 400 }}>
        <CustomDataGrid
          rows={filteredRows}
          columns={activeTab === 0 ? workTypeCols : tenderCols}
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
