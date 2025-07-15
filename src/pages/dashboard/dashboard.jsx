import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import DescriptionIcon from '@mui/icons-material/Description';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


import { getAllProjectDetails } from '../../api/ProjectDetailsAPI/projectDetailsApi';
import { getAllReportList } from '../../api/reportApi/reportApi';
import { getAllTenderList } from '../../api/TenderTrackingAPI/tenderTrackingApi';

const tabData = [
  { label: 'Vulnerability', icon: <DescriptionIcon />, key: 'projectName' },
  { label: 'Work Type', icon: <WorkIcon />, key: 'workType' },
  { label: 'Tender Tracking', icon: <RequestQuoteIcon />, key: 'tenderTracking' },
];

export default function TabCardWithGrids() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [projectNameRows, setProjectNameRows] = useState([]);
  const [workTypeRows, setWorkTypeRows] = useState([]);
  const [tenderRows, setTendereRows] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const reportData = await getAllReportList();
        const workTypeData = await getAllProjectDetails();
        const TenderData = await getAllTenderList({ isDeleted: false });

        setProjectNameRows(reportData.data.map((r, i) => ({ id: i + 1, ...r })));
        setWorkTypeRows(workTypeData.data.map((r, i) => ({ id: i + 1, ...r })));
        setTendereRows(TenderData.data.map((r, i) => ({ id: i + 1, ...r })));
      } catch (error) {
        console.error('API fetch error:', error);
      }
    }
    fetchData();
  }, []);

  const searchFilter = (rows) => {
    if (!search.trim()) return rows;
    return rows.filter((row) =>
      Object.values(row).join(' ').toLowerCase().includes(search.toLowerCase())
    );
  };

  const projectNameCols = [
    {
      field: 'projectNameDisplay',
      headerName: 'Project Name',
      flex: 1,
      renderCell: (params) => params.row?.projectName?.projectName || 'N/A'
    },
    { field: 'projectType', headerName: 'Project Type', flex: 1 },
    {
      field: 'round',
      headerName: 'Round',
      flex: 1,
      renderCell: (params) => `Round - ${params?.row?.round ?? 'N/A'}`
    },
    { field: 'vulnerabilityName', headerName: 'Vulnerability Name', flex: 1 },
    { field: 'sevirty', headerName: 'Severity', flex: 1 },
    { field: 'devices', headerName: 'Devices', flex: 1 }
  ];

  const workTypeCols = [
    { field: 'typeOfWork', headerName: 'Type Of Work', flex: 1 },
    {
      field: 'startDate',
      headerName: 'Start Date',
      flex: 1,
      renderCell: (params) => {
        const date = params?.row?.startDate;
        return date ? dayjs(date).format('DD-MM-YYYY') : 'N/A';
      }
    },
    { field: 'directrate', headerName: 'Directorate', flex: 1 },
    {
      field: 'projectValue',
      headerName: 'Value (INR)',
      flex: 1,
      renderCell: (params) => {
        const val = params?.row?.projectValue;
        return val ? Number(val).toLocaleString('en-IN') : 'N/A';
      }
    },
    { field: 'primaryPersonName', headerName: 'Person Name', flex: 1 },
  ];

  const tenderCols = [
    { field: 'tenderName', headerName: 'Tender Name', flex: 1 },
    { field: 'organizationName', headerName: 'Organization Name', flex: 1 },
    { field: 'state', headerName: 'State', flex: 1 },
    { field: 'taskForce', headerName: 'Task Force', flex: 1 },
    {
      field: 'valueINR',
      headerName: 'Value (INR)',
      flex: 1,
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
      case 'projectName': return projectNameRows;
      case 'tenderTracking': return tenderRows;
      default: return [];
    }
  };

  const getCurrentTabColumns = () => {
    switch (tabData[activeTab].key) {
      case 'workType': return workTypeCols;
      case 'projectName': return projectNameCols;
      case 'tenderTracking': return tenderCols;
      default: return [];
    }
  };

  function CustomNoRowsOverlay() {
    return (
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ color: 'red', fontWeight: 'bold' }}>
          No data found
        </Typography>
      </Box>
    );
  }

  // 📁 Export CSV
 const handleDownloadCSV = () => {
  const columns = getCurrentTabColumns();
  const rawRows = searchFilter(getCurrentTabRows());

  const headers = columns.map(col => `"${col.headerName}"`).join(',');

  const data = rawRows.map(row => {
    return columns.map(col => {
      let value = '';

      switch (col.field) {
        case 'projectNameDisplay':
          value = row.projectName?.projectName || 'N/A';
          break;
        case 'round':
          value = row.round ? `Round - ${row.round}` : 'N/A';
          break;
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


  // 📄 Export PDF

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
        case 'projectNameDisplay':
          formatted[col.dataKey] = row.projectName?.projectName || 'N/A';
          break;
        case 'round':
          formatted[col.dataKey] = row.round ? `Round - ${row.round}` : 'N/A';
          break;
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
    <Box sx={{ width: '100%' }}>
      {/* Tab Cards */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        {tabData.map((tab, index) => (
          <Paper
            key={index}
            onClick={() => setActiveTab(index)}
            elevation={3}
            sx={{
              width: 250,
              height: 100,
              cursor: 'pointer',
              borderRadius: 3,
              px: 2,
              py: 1.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background: activeTab === index
                ? 'linear-gradient(to right, #2196f3, #21cbf3)'
                : '#f5f5f5',
              color: activeTab === index ? '#fff' : '#000',
              '&:hover': {
                boxShadow: 6,
              },
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center" gap={1}>
              {tab.icon}
              {tab.label}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Search */}
      <TextField
        label="Search..."
        variant="outlined"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          mb: 2,
          backgroundColor: 'white',
          '& .MuiInputBase-root': {
            height: 40,
          },
        }}
      />

      {/* Export Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="contained" onClick={handleDownloadCSV}>Download CSV</Button>
        <Button variant="contained" color="secondary" onClick={handleDownloadPDF}>Download PDF</Button>
      </Box>

      {/* Data Table */}
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
    </Box>
  );
}
