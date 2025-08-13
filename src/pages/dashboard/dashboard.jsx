/* global am4core, am4charts, am4themes_animated */

import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Paper, Typography, TextField, Button
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { DataGrid } from '@mui/x-data-grid';

import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Tooltip as MuiTooltip, Stack } from '@mui/material';
import { getAllProjectDetails, getAllprojectData } from '../../api/ProjectDetailsAPI/projectDetailsApi';
import { getAllReportList } from '../../api/reportApi/reportApi';
import { getAllTenderList } from '../../api/TenderTrackingAPI/tenderTrackingApi';

const tabData = [
  { label: 'Projects', icon: <WorkIcon />, key: 'workType' },
  { label: 'Tender Tracking', icon: <RequestQuoteIcon />, key: 'tenderTracking' },
];

export default function TabCardWithGrids() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [workTypeRows, setWorkTypeRows] = useState([]);
  const [tenderRows, setTendereRows] = useState([]);
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState([]);

  function groupByFinancialYear(data) {
    const yearMap = {};
    data.forEach((project) => {
      const { startDate, projectValue } = project;
      const date = new Date(startDate);
      const month = date.getMonth();
      const year = date.getFullYear();
      const fyStartYear = month < 3 ? year - 1 : year;
      const fyEndYear = fyStartYear + 1;
      const fyLabel = `FY-${fyStartYear}-${fyEndYear}`;
      const value = parseFloat(projectValue || "0");
      if (!yearMap[fyLabel]) {
        yearMap[fyLabel] = { financialYear: fyLabel, Total: 0 };
      }
      yearMap[fyLabel].Total += value;
    });
    return Object.values(yearMap).map(({ financialYear, Total }) => ({
      financialYear,
      Total: +(Total / 10000000).toFixed(2),
    }));
  }

  // Effect to fetch project data for the chart
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const res = await getAllprojectData();
        const projects = Array.isArray(res?.data)
          ? res.data
          : res?.data?.data || [];
        const fyData = groupByFinancialYear(projects);
        setChartData(fyData);
      } catch (err) {
        console.error("Error fetching project data:", err);
      }
    };
    fetchProjectData();
  }, []);

  // Effect to fetch data for the DataGrid tabs
  useEffect(() => {
    async function fetchData() {
      try {
        const reportData = await getAllReportList(); // This API is not used in the final code, but it's in your original code
        const workTypeData = await getAllProjectDetails();
        const TenderData = await getAllTenderList({ isDeleted: false });
        setWorkTypeRows(workTypeData.data.map((r, i) => ({ id: r._id || i + 1, sno: i + 1, ...r })));
        setTendereRows(TenderData.data.map((r, i) => ({ id: r._id || i + 1, sno: i + 1, ...r })));
      } catch (error) {
        console.error('API fetch error:', error);
      }
    }
    fetchData();
  }, []);

  // Fix for the chart lifecycle management
  useEffect(() => {
    // Only run this effect if the 'Projects' tab is active.
    if (activeTab === 0 && chartData.length > 0) {
      const core = window.am4core;
      const charts = window.am4charts;
      const animated = window.am4themes_animated;

      // Dispose of the existing chart instance before creating a new one.
      if (chartRef.current) {
        chartRef.current.dispose();
      }

      core.useTheme(animated);
      const chart = core.create("chartdiv", charts.XYChart);
      chartRef.current = chart;

      chart.data = chartData.map(item => ({
        category: item.financialYear,
        value: item.Total,
      }));

      let categoryAxis = chart.xAxes.push(new charts.CategoryAxis());
      categoryAxis.dataFields.category = "category";
      categoryAxis.title.text = "Financial Year";

      let valueAxis = chart.yAxes.push(new charts.ValueAxis());
      valueAxis.title.text = "Project Value (Cr INR)";

      let series = chart.series.push(new charts.ColumnSeries());
      series.dataFields.valueY = "value";
      series.dataFields.categoryX = "category";
      series.columns.template.width = 50;

      let labelBullet = series.bullets.push(new charts.LabelBullet());
      labelBullet.label.text = "{valueY} Cr";
      labelBullet.label.fontSize = 12;
      labelBullet.label.fontWeight = "600";
      labelBullet.label.fill = core.color("#000");
      labelBullet.label.dy = -5;
      labelBullet.label.horizontalCenter = "middle";

      series.name = "Project Value";
      series.columns.template.tooltipText = "{categoryX}: [bold]{valueY} Cr[/]";

      // Cleanup function to dispose of the chart instance.
      return () => {
        if (chartRef.current) {
          chartRef.current.dispose();
        }
      };
    }
  }, [activeTab, chartData]);

  const searchFilter = (rows) => {
    if (!search.trim()) return rows;
    return rows.filter((row) =>
      Object.values(row).join(' ').toLowerCase().includes(search.toLowerCase())
    );
  };

  const workTypeCols = [
    { field: 'sno', headerName: 'S.No', width: 80, },
    { field: 'typeOfWork', headerName: 'Type Of Work', flex: 1 },
    {
      field: 'startDate', headerName: 'Start Date', flex: 1,
      renderCell: (params) => {
        const date = params?.row?.startDate;
        return date ? dayjs(date).format('DD-MM-YYYY') : 'N/A';
      }
    },
    { field: 'directrate', headerName: 'Directorate', flex: 1 },
    {
      field: 'projectValue', headerName: 'Value (INR)', flex: 1,
      renderCell: (params) => {
        const val = params?.row?.projectValue;
        return val ? Number(val).toLocaleString('en-IN') : 'N/A';
      }
    },
    { field: 'primaryPersonName', headerName: 'Person Name', flex: 1 },
  ];

  const tenderCols = [
    { field: 'sno', headerName: 'S.No', width: 80, },
    { field: 'tenderName', headerName: 'Tender Name', flex: 1 },
    { field: 'organizationName', headerName: 'Organization Name', flex: 1 },
    { field: 'state', headerName: 'State', flex: 1 },
    { field: 'taskForce', headerName: 'Task Force', flex: 1 },
    {
      field: 'valueINR', headerName: 'Value (INR)', flex: 1,
      renderCell: (params) => {
        const val = params?.row?.valueINR;
        return val ? Number(val).toLocaleString('en-IN') : 'N/A';
      }
    },
    { field: 'status', headerName: 'Status', flex: 1 },
  ];

  const getCurrentTabRows = () => {
    switch (tabData[activeTab].key) {
      case 'workType': return workTypeRows;
      case 'tenderTracking': return tenderRows;
      default: return [];
    }
  };

  const getCurrentTabColumns = () => {
    switch (tabData[activeTab].key) {
      case 'workType': return workTypeCols;
      case 'tenderTracking': return tenderCols;
      default: return [];
    }
  };

  function CustomNoRowsOverlay() {
    return (
      <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', }}>
        <Typography sx={{ color: 'red', fontWeight: 'bold' }}>
          No data found
        </Typography>
      </Box>
    );
  }

  const handleDownloadCSV = () => {
    const columns = getCurrentTabColumns();
    const rawRows = searchFilter(getCurrentTabRows());
    const headers = columns.map(col => `"${col.headerName}"`).join(',');
    const data = rawRows.map(row => {
      return columns.map(col => {
        let value = '';
        switch (col.field) {
          case 'projectValue':
            value = row.projectValue ? Number(row.projectValue).toLocaleString('en-IN') : 'N/A';
            break;
          case 'startDate':
            value = row.startDate ? dayjs(row.startDate).format('DD-MM-YYYY') : 'N/A';
            break;
          default:
            value = row[col.field] ?? 'N/A';
        }
        return `"${value}"`;
      }).join(',');
    });
    const csvContent = [headers, ...data].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${tabData[activeTab].label.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const columns = getCurrentTabColumns().map(col => ({
      header: col.headerName,
      dataKey: col.field,
    }));
    const rawRows = searchFilter(getCurrentTabRows());
    const rows = rawRows.map(row => {
      const formatted = {};
      columns.forEach(col => {
        switch (col.dataKey) {
          case 'projectValue':
            formatted[col.dataKey] = row.projectValue
              ? Number(row.projectValue).toLocaleString('en-IN')
              : 'N/A';
            break;
          case 'startDate':
            formatted[col.dataKey] = row.startDate
              ? dayjs(row.startDate).format('DD-MM-YYYY')
              : 'N/A';
            break;
          default:
            formatted[col.dataKey] = row[col.dataKey] ?? 'N/A';
        }
      });
      return formatted;
    });
    autoTable(doc, {
      columns,
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33, 150, 243] },
    });
    doc.save(`${tabData[activeTab].label.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        {tabData.map((tab, index) => (
          <Paper
            key={index}
            onClick={() => setActiveTab(index)}
            elevation={3}
            sx={{
              width: 200, height: 70, cursor: 'pointer', borderRadius: 3, px: 2, py: 1.5,
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              background: activeTab === index
                ? 'linear-gradient(to right, #2196f3, #21cbf3)'
                : '#f5f5f5',
              color: activeTab === index ? '#fff' : '#000',
              '&:hover': { boxShadow: 6 },
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center" gap={1}>
              {tab.icon}
              {tab.label}
            </Typography>
          </Paper>
        ))}
      </Box>

      {activeTab === 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            Project Value Overview (Cr INR)
          </Typography>
          <Box id="chartdiv" sx={{ width: '100%', height: 300 }} />
        </>
      )}

      <Stack direction="row" spacing={2} mb={2}>
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
        '& .MuiInputBase-root': {
          height: 40,
        },
        width: '70%',
      }}
    />
      <Button variant="contained" onClick={handleDownloadCSV}>
        Download CSV
      </Button>
      <Button variant="contained" color="secondary" onClick={handleDownloadPDF}>
        Download PDF
      </Button>
    </Stack>

      <Box sx={{ height: 400 }}>
        <DataGrid
          rows={searchFilter(getCurrentTabRows())}
          columns={getCurrentTabColumns()}
          pageSize={5}
          rowsPerPageOptions={[5, 10]}
          pagination
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
          }}
        />
      </Box>
    </>
  );
}