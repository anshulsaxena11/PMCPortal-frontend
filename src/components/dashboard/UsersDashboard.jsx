import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Stack, Button } from '@mui/material';
import { Card } from 'react-bootstrap';
// Assuming you have a CustomDataGrid component and user columns defined elsewhere
import CustomDataGrid from '../../components/DataGrid/CustomDataGrid'; 
import { getLoginList } from '../../api/loginApi/loginApi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// --- DataGrid Columns for Users (Placeholder) ---
const userCols = [
    { field: 'sno', headerName: 'S.No', width: 80 },
    { field: 'ename', headerName: 'Name', flex: 1 },
    { field: 'empId', headerName: 'Employee ID', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1.5 },
   
    { 
        field: 'taskForceMember', 
        headerName: 'Task Force Member', 
        width: 150,
        renderCell: (params) => String(params.value || '').trim().toLowerCase() === 'yes' ? 'Yes' : 'No'
    },
    { 
        field: 'StatusNoida', 
        headerName: 'Status Noida', 
        width: 150,
        renderCell: (params) => (params.value === true || String(params.value).toLowerCase() === 'true') ? 'True' : 'False'
    },
];
// ----------------------------------------------------

// --- Utility Functions (for search filtering - based on target component) ---
function getFilteredRows(rows, term) {
    const lower = term.toLowerCase().trim();
    if (!lower) return rows;
    return rows.filter((row) =>
        Object.values(row).some(
            (val) => String(val || "").toLowerCase().includes(lower)
        )
    );
}
// --- Export Functionality (Placeholder for CSV/PDF) ---
const exportToCsv = (data, filename = 'user_data') => {
    // Helper function to convert data to CSV string
    const convertToCSV = (arr) => {
        const headers = userCols.map(col => col.headerName).join(',');
        const rows = arr.map(row => 
            userCols.map(col => {
                let value = col.valueGetter ? col.valueGetter({row}) : row[col.field];

                // Simple boolean/string formatting for display
                if (col.field === 'taskForceMember') {
                    value = String(value || '').trim().toLowerCase() === 'yes' ? 'Yes' : 'No';
                } else if (col.field === 'StatusNoida') {
                    value = (value === true || String(value).toLowerCase() === 'true') ? 'True' : 'False';
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

const exportToPdf = (data, filename = 'user_data') => {
    // PDF export logic remains the same (uses jspdf and jspdf-autotable)
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.text(`User Report - Filter: ${data.length} users`, 14, 10);

    const headers = [userCols.map(col => col.headerName)];
    const body = data.map(row => 
        userCols.map(col => {
            let value = col.valueGetter ? col.valueGetter({row}) : row[col.field];

            // Simple boolean/string formatting for display
            if (col.field === 'taskForceMember') {
                value = String(value || '').trim().toLowerCase() === 'yes' ? 'Yes' : 'No';
            } else if (col.field === 'StatusNoida') {
                value = (value === true || String(value).toLowerCase() === 'true') ? 'True' : 'False';
            }
            
            return String(value || 'N/A');
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

// ----------------------------------------------------

// Simplified/New Styles (matching the target dashboard)
const statCardStyle = {
    padding: 0,
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
};

export default function UsersDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedDirectorate, setSelectedDirectorate] = useState('All');
    const [directorates, setDirectorates] = useState([]);
    const [page, setPage] = useState(0); // for CustomDataGrid
    const [pageSize, setPageSize] = useState(10); // for CustomDataGrid

    const fetchUsers = async () => {
        setLoading(true);
        try {
           const res = await getLoginList({ page: 1, limit: 10000, search: '' });
            const all = res?.data?.data || [];
            
            // Add an ID to each user for the DataGrid
            const processedUsers = all.map((u, i) => ({ ...u, id: u._id || i + 1 }));

            setUsers(processedUsers);
            const dirs = Array.from(new Set(all.map(u => u.dir || u.directrate || 'Unknown')));
            setDirectorates(dirs.filter(Boolean));
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Users fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // --- Stats Calculation (Same as original) ---
    const totalUsers = users.length;
    const taskForceYes = users.filter(u => String(u.taskForceMember || '').trim().toLowerCase() === 'yes').length;
    const taskForceNo = Math.max(0, totalUsers - taskForceYes);
    const tfPercent = totalUsers ? Math.round((taskForceYes / totalUsers) * 100) : 0;
    const statusNoidaCount = users.filter(u => u.StatusNoida === true || String(u.StatusNoida).toLowerCase() === 'true').length;
    const StateCordinatorCount = users.filter(u => u.StateCordinator === true || String(u.StateCordinator).toLowerCase() === 'true').length;

    const dirMap = {};
    users.forEach(u => {
        const dir = u.dir || u.directrate || 'Unknown';
        if (!dirMap[dir]) dirMap[dir] = { count: 0, tfYes: 0, statusNoidaTrue: 0 };
        dirMap[dir].count += 1;
        if (String(u.taskForceMember || '').trim().toLowerCase() === 'yes') dirMap[dir].tfYes += 1;
        if (u.StatusNoida === true || String(u.StatusNoida).toLowerCase() === 'true') dirMap[dir].statusNoidaTrue += 1;
    });
    const dirArray = Object.keys(dirMap).map(k => ({ directorate: k, ...dirMap[k] }));
    dirArray.sort((a, b) => b.count - a.count);

    // --- Right Content Stats Array (Matching target dashboard's stats structure) ---
    const stats = [
        { title: "Total Users", value: totalUsers },
        { title: "Task Force User", value: taskForceYes},
        { title: "VAPT User", value: taskForceNo },       
        { title: "State Coordinator", value: StateCordinatorCount},
    ];
    
    // --- Filtering Logic (Combined original and target component structure) ---
    let filteredUsers = users;

    // 1. Directorate Filter
    if (selectedDirectorate !== 'All') {
        filteredUsers = filteredUsers.filter(u => {
            const dir = u.dir || u.directrate || 'Unknown';
            return dir === selectedDirectorate;
        });
    }

    // 2. Search Term Filter (Simplified to use the utility function)
    filteredUsers = getFilteredRows(filteredUsers, search);
    // ----------------------------------------------------

    return (
        <>
            {/* Header/Filter Section - Matching target component's filter bar style */}
            <Stack direction="row" spacing={2} mb={2} alignItems="center" flexWrap="wrap">
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">Users Dashboard</Typography>
                </Box>
                <Box sx={{ flex: 1 }} />
                
            </Stack>

            <div className="dashboard-wrapper">

                {/* Left Sidebar: Directorate Wise Users - Matching target component style */}
                <aside className="left-sidebar">
                    <h5 className="left-title">Directorate Wise Users</h5>
                    <div className="left-scroll">
                        
                        {/* All Directorates Card */}
                        <Card
                            className="mb-2 left-item"
                            onClick={() => setSelectedDirectorate('All')}
                            style={{ cursor: 'pointer', background: selectedDirectorate === 'All' ? '#e0f7fa' : 'white', ...statCardStyle }}
                        >
                            <Card.Body className="py-2 px-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="small"><strong>All Users ({totalUsers})</strong></div>
                                </div>
                                <div className="mt-1 d-flex justify-content-between small">
                                    <span>Task Force User: {taskForceYes}</span>
                                  
                                    <span>VAPT User: {statusNoidaCount}</span>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Individual Directorate Cards */}
                        {dirArray.map((d, i) => (
                            <Card
                                key={i}
                                className="mb-2 left-item"
                                onClick={() => setSelectedDirectorate(d.directorate)}
                                style={{ cursor: 'pointer', background: selectedDirectorate === d.directorate ? '#e0f7fa' : 'white', ...statCardStyle }}
                            >
                                <Card.Body className="py-2 px-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="small"><strong>{d.directorate}</strong></div>
                                        <div className="text-end">
                                            <div className="fw-bold">{d.count} Users</div>
                                        </div>
                                    </div>
                                    <div className="mt-1 d-flex justify-content-between small">
                                        <span>Task Force User: {d.tfYes}</span>
                                        <span>VAPT User: {d.statusNoidaTrue}</span>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                </aside>


<main className="right-content">
          <h5 className="mb-3">Users Overview</h5> 
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
            
            {/* User Details DataGrid Section (NEW) */}
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1 }}>
                User Details ({selectedDirectorate !== 'All' ? selectedDirectorate : 'All Users'})
            </Typography>

            <Stack direction="row" spacing={2} mb={2} alignItems="center" flexWrap="wrap">
              <Box>
                    <label><b>Directorate Filter:</b></label>{" "}
                    <select
                        value={selectedDirectorate}
                        onChange={(e) => setSelectedDirectorate(e.target.value)}
                        style={{ padding: "6px 10px", borderRadius: "6px", minWidth: "200px" }}
                    >
                        <option value="All">All ({users.length})</option>
                        {directorates.map((dir, i) => (
                            <option key={i} value={dir}>{dir}</option>
                        ))}
                    </select>
                </Box>
                <TextField
                    label="Search users..."
                    variant="outlined"
                    value={search}
                    size="small"
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                        width: 250,
                        backgroundColor: 'white',
                        '& .MuiInputBase-root': { height: 40 },
                        minWidth: 200
                    }}
                />
                
                <Box sx={{ flex: 1 }} />
                <Button 
                    variant="contained" 
                    color="secondary" 
                    size="small"
                    onClick={() => exportToPdf(filteredUsers, `User_Report_${selectedDirectorate}`)}
                    sx={{ minWidth: 100, height: 40 }}
                >
                    Download PDF
                </Button>
                <Button 
                    variant="contained" 
                    color="primary" 
                    size="small"
                    onClick={() => exportToCsv(filteredUsers, `User_Data_${selectedDirectorate}`)}
                    sx={{ minWidth: 100, height: 40 }}
                >
                    Download CSV
                </Button>
            </Stack>

            <Box sx={{ height: 400 }}>
                <CustomDataGrid
                    rows={filteredUsers.map((row, index) => ({...row, sno: index + 1}))}
                    columns={userCols}
                    loading={loading}
                    paginationModel={{ page, pageSize }}
                    onPaginationModelChange={({ page, pageSize }) => {
                        setPage(page);
                        setPageSize(pageSize);
                    }}
                    rowCount={filteredUsers.length}
                    paginationMode="client"
                    autoHeight
                />
            </Box>
        </>
    );
}