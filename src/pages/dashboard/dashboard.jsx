/* global am4core, am4charts, am4themes_animated */

import React, { useEffect, useState, useRef } from 'react';
import { Box, Paper, Typography, TextField, Button, IconButton, Stack, Tooltip } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getProjectDetailsList } from '../../api/ProjectDetailsAPI/projectDetailsApi';
import { getAllTenderList } from '../../api/TenderTrackingAPI/tenderTrackingApi';
import CustomDataGrid from '../../components/DataGrid/CustomDataGrid';

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
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const userRole = localStorage.getItem('userRole');

  // ---- Helper: Group projects by Financial Year (using startDate) ----




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
    .sort((a, b) => a.startYear - b.startYear) // 🔑 sort ascending
    .map(({ financialYear, Total }) => ({ financialYear, Total })); // remove helper field
}

  

  // ---- Fetch all data ----
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Pass safe defaults to avoid "params.page is undefined" inside your API helper
      const workTypeResponse = await getProjectDetailsList({ page: 1, limit: 100, isDeleted: false });
      const tenderResponse = await getAllTenderList({ isDeleted: false });

      // Transform projects (ensure numeric projectValue, compute amountStatus & projectType)
      const transformedWorkTypeData = (workTypeResponse?.data || []).map((item, index) => {
        const amountStatus = item?.phases?.[0]?.amountStatus || 'N/A';
        const projectType = Array.isArray(item?.projectType) && item.projectType.length > 0
          ? item.projectType[0]?.ProjectTypeName || 'N/A'
          : (item.projectType || 'N/A');

        return {
          id: item?._id || index + 1,
          sno: index + 1,
          ...item,
          projectValue: Number(item?.projectValue) || 0,
          amountStatus,
          projectType,
        };
      });

      // ✅ Use the transformed data in the grid
      setWorkTypeRows(transformedWorkTypeData);

      // Tenders untouched
      setTendereRows((tenderResponse?.data || []).map((r, i) => ({
        id: r?._id || i + 1,
        sno: i + 1,
        ...r,
      })));

      // Build chart data from transformed projects
      const processedChartData = groupByFinancialYear(transformedWorkTypeData);
      setChartData(processedChartData);
    } catch (error) {
      console.error('API fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ---- Render amCharts XY Column chart ----
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

  // ---- Search filter ----
  const searchFilter = (rows) => {
    if (!search.trim()) return rows;
    const lower = search.toLowerCase().trim();

    return rows.filter((row) => {
      if (!row || typeof row !== 'object') return false;
      for (const key in row) {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
          const value = row[key];
          if (value !== null && value !== undefined) {
            if (String(value).toLowerCase().includes(lower)) {
              return true;
            }
          }
        }
      }
      return false;
    });
  };

  // ---- Columns ----
  const workTypeCols = [
    { field: 'sno', headerName: 'S. No.', width: 60, sortable: false, filterable: false },
    { field: 'orginisationName', headerName: 'Organisation Name', flex: 1.5 },
    { field: 'type', headerName: 'Org Type', flex: 1 },
    { field: 'orderType', headerName: 'Order Type', flex: 1 },
    { field: 'projectName', headerName: 'Project Name', flex: 1 },
    { field: 'typeOfWork', headerName: 'Type Of Work', flex: 1 },
    { field: 'amountStatus', headerName: 'Status', flex: 1 },
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
    { field: 'state', headerName: 'State', flex: 1 },
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
      // Check if params.value exists and is a valid date
      if (params.value) {
        return dayjs(params.value).format('YYYY-MM-DD');
      }
      return 'N/A';
    },
  },
    
  ];

  const getCurrentTabRows = () => {
    switch (tabData[activeTab].key) {
      case 'workType':
        return workTypeRows;
      case 'tenderTracking':
        return tenderRows;
      default:
        return [];
    }
  };

  const getCurrentTabColumns = () => {
    switch (tabData[activeTab].key) {
      case 'workType':
        return workTypeCols;
      case 'tenderTracking':
        return tenderCols;
      default:
        return [];
    }
  };

  // ---- Export helpers ----
  const handleDownloadCSV = () => {
    const columns = getCurrentTabColumns();
    const rawRows = searchFilter(getCurrentTabRows());
    const headers = columns.map((col) => `"${col.headerName}"`).join(',');
    const data = rawRows.map((row) => {
      return columns
        .map((col) => {
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
        })
        .join(',');
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
    const columns = getCurrentTabColumns().map((col) => ({
      header: col.headerName,
      dataKey: col.field,
    }));
    const rawRows = searchFilter(getCurrentTabRows());
    const rows = rawRows.map((row) => {
      const formatted = {};
      columns.forEach((col) => {
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

  const filteredRows = searchFilter(getCurrentTabRows());

  return (
    <>
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
          <Typography variant="h6" gutterBottom>
            Project Value Overview (Cr INR)
          </Typography>
          <Box id="chartdiv" sx={{ width: '100%', height: 300 }} />
        </>
      )}

      <Stack direction="row" spacing={2} mb={2} alignItems="center">
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
            flexGrow: 1,
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
        <CustomDataGrid
          rows={filteredRows}
          columns={getCurrentTabColumns()}
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
