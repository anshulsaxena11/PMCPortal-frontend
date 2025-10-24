// SalesTrackingDashboard.jsx

/* global am4core, am4charts, am4themes_animated */
import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, TextField, Stack, Tooltip, Button } from '@mui/material';
import { Card } from "react-bootstrap";
import dayjs from 'dayjs';
import CustomDataGrid from '../../components/DataGrid/CustomDataGrid';
import { getAllTenderList } from '../../api/TenderTrackingAPI/tenderTrackingApi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
            Total: +(Total / 10000000).toFixed(2), // Convert to Cr
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

export default function SalesTrackingDashboard() {
  // --- State ---
  const [search, setSearch] = useState('');
  const [tenderRows, setTendereRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedDirectorateTender, setSelectedDirectorateTender] = useState("All"); 
  const [directorateTenderOptions, setDirectorateTenderOptions] = useState([]); 
  const [directorateTenderData, setDirectorateTenderData] = useState([]); 
  const [stats, setStats] = useState([]); 
  const [chartData, setChartData] = useState([]); 
  const [selectedFY, setSelectedFY] = useState("All"); // NEW FY state
  const [financialYears, setFinancialYears] = useState([]); // NEW FY state
  const [currentSummary, setCurrentSummary] = useState(null); // <-- new
  const [deletedSummary, setDeletedSummary] = useState(null); // <-- new
  const chartDivRef = useRef(null);            // DOM container ref
  const chartInstanceRef = useRef(null);       // amCharts chart instance ref
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
                    value = (Number(value) / 10000000).toFixed(2); // Export as Crore value
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
                return (val / 10000000).toFixed(2) + ' Cr';
            }
            return String(row[col.field] || 'N/A');
        })
    );

    doc.autoTable({
        head: headers,
        body: body,
        startY: 15,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 144, 255] },
    });
    doc.save(`${filename}.pdf`);
  };
  // --- Data Fetching (UPDATED to include FY filter) ---
  const fetchTenderData = async (yearFilter = "All") => {
    setLoading(true);
    try {
      const tenderResponse = await getAllTenderList({ isDeleted: false });
      let tenderData = tenderResponse?.data || [];
      
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

      const processedTenderRows = tenderData.map((r, i) => ({
        id: r?._id || i + 1,
        sno: i + 1,
        ...r,
      }));
      setTendereRows(processedTenderRows);
      
      const uniqueTenderDirectorates = Array.from(new Set(processedTenderRows.map(t => t.directrate).filter(Boolean)));
      setDirectorateTenderOptions(uniqueTenderDirectorates);

      // --- STATS AND SIDEBAR CALCULATION ---
      const dirMap = {};
      let totalValue = 0, submitted = 0, closedOrLost = 0;

      processedTenderRows.forEach(t => {
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
        { title: "Total Value", value: (totalValue / 1e7).toFixed(2) + " Cr", icon: "💰" },
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

  // Re-fetch data whenever the selectedFY changes
  useEffect(() => {
    // Reset directorate filter when FY changes
    setSelectedDirectorateTender("All"); 
    fetchTenderData(selectedFY);
  }, [selectedFY]);
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
        valueAxis.title.text = 'Tender Value (Cr INR)';
        valueAxis.renderer.grid.template.strokeOpacity = 0.3;


        const series = chart.series.push(new charts.ColumnSeries());
        series.dataFields.valueY = 'value';
        series.dataFields.categoryX = 'category';
        
        series.columns.template.fill = core.color("#ff9800"); 
        series.columns.template.strokeOpacity = 0;
        series.columns.template.width = core.percent(10); 
        series.columns.template.tooltipText = '{categoryX}: [bold]{valueY} Cr[/]';
        
        const labelBullet = series.bullets.push(new charts.LabelBullet());
        labelBullet.label.text = '{valueY} Cr';
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
      {/* Financial Year Dropdown (NEW) */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">Financial Year:</Typography>
        <select
          value={selectedFY}
          onChange={(e) => setSelectedFY(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: "6px" }}
        >
          {/* Ensure FYs exist before rendering */}
          {financialYears.length > 0 && 
            [financialYears[0], ...financialYears.slice(1).reverse()].map((fy, i) => (
              <option key={i} value={fy}>{fy}</option>
            ))}
        </select>
      </Box>

      <div className="dashboard-wrapper">
        {/* Left Sidebar: Directorate Wise Tenders */}
        <aside className="left-sidebar">
          <h5 className="left-title">Directorate Wise Tenders</h5>
          <div className="left-scroll">
            <Card 
              className="mb-2 left-item" 
              onClick={() => setSelectedDirectorateTender("All")} 
              style={{ cursor: 'pointer', background: selectedDirectorateTender === "All" ? '#e0f7fa' : 'white' }}
            >
              <Card.Body className="py-2 px-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="small"><strong>All Directorates ({tenderRows.length})</strong></div>
                </div>
              </Card.Body>
            </Card>
            {directorateTenderData.map((d, i) => (
              <Card
                key={i} 
                className="mb-2 left-item" 
                onClick={() => setSelectedDirectorateTender(d.directorate)}
                style={{ cursor: 'pointer', background: selectedDirectorateTender === d.directorate ? '#e0f7fa' : 'white' }}
              >
                <Card.Body className="py-2 px-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="small"><strong>{d.directorate}</strong></div>
                    <div className="text-end">
                      <div className="fw-bold">{d.count} Tenders</div>
                      <div className="small">Value: {(d.value / 1e7).toFixed(2)} Cr</div>
                    </div>
                  </div>                 
                </Card.Body>
              </Card>
            ))}
          </div>
        </aside>

        {/* Right Content: Sales Overview Stats */}
        <main className="right-content">
          <h5 className="mb-3">Sales Overview</h5>

          {/* NEW: Current Tenders box */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            <Card style={{ minWidth: 260, borderRadius: 10 }}>
              <div style={{ padding: '12px 16px', background: '#0b8b84', color: '#fff', fontWeight: 600 }}>
                Current Tenders
              </div>
              <div style={{ padding: '12px 16px', background: '#fff' }}>
                <div>Total: {currentSummary ? currentSummary.total : '...'}</div>
                <div>Upload: {currentSummary ? currentSummary.upload : '...'}</div>
                <div>Bidding: {currentSummary ? currentSummary.bidding : '...'}</div>
                <div>Not Bidding: {currentSummary ? currentSummary.notBidding : '...'}</div>
              </div>
            </Card>

            {/* NEW: Deleted Tenders box */}
            <Card style={{ minWidth: 260, borderRadius: 10 }}>
              <div style={{ padding: '12px 16px', background: '#6b5b95', color: '#fff', fontWeight: 600 }}>
                Deleted Tenders
              </div>
              <div style={{ padding: '12px 16px', background: '#fff' }}>
                <div>Total: {deletedSummary ? deletedSummary.total : '...'}</div>
                <div>Upload: {deletedSummary ? deletedSummary.upload : '...'}</div>
                <div>Bidding: {deletedSummary ? deletedSummary.bidding : '...'}</div>
                <div>Not Bidding: {deletedSummary ? deletedSummary.notBidding : '...'}</div>
                <div style={{ marginTop: 8 }}>Won: {deletedSummary ? deletedSummary.won : '...'} Lost: {deletedSummary ? deletedSummary.lost : '...'}</div>
              </div>
            </Card>
          </div>

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
      
      {/* Chart Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1 }}>
        Tender Value Overview (Cr INR)
      </Typography>
      <div id="chartdiv" ref={chartDivRef} style={{ width: '100%', height: 420 }} />

      {/* Filtering and DataGrid Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1 }}>
        Tender Details
      </Typography>

      <Stack direction="row" spacing={2} mb={2} alignItems="center" flexWrap="wrap">
        <Box>
          <label><b>Directorate Filter:</b></label>{" "}
          <select
            value={selectedDirectorateTender}
            onChange={(e) => setSelectedDirectorateTender(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "6px", minWidth: "200px" }}
          >
            <option value="All">All ({tenderRows.length})</option>
            {directorateTenderOptions.map((dir, i) => (
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
        <Button 
          variant="contained" 
          color="secondary" 
          size="small"
          onClick={() => exportToPdf(filteredRows, `Tender_Report_${selectedFY}`)}
          sx={{ minWidth: 100, height: 40 }}
        >
          Download PDF
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          size="small"
          onClick={() => exportToCsv(filteredRows, `Tender_Data_${selectedFY}`)}
          sx={{ minWidth: 100, height: 40 }}
        >
          Download CSV
        </Button>
      </Stack>

      <Box sx={{ height: 400 }}>
        <CustomDataGrid
          rows={filteredRows.map((row, index) => ({...row, sno: index + 1}))}
          columns={tenderCols}
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