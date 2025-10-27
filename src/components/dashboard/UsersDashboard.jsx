import React, { useEffect, useState, useRef } from 'react';
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
    { field: 'email', headerName: 'Email', flex: 1.2 },
    // NEW: State Coordinator column (shows Yes/No)
    {
        field: 'StateCordinator',
        headerName: 'State Coordinator',
        width: 150,
        renderCell: (params) => (params.value === true || String(params.value).toLowerCase() === 'true') ? 'Yes' : 'No'
    },
    { 
        field: 'taskForceMember', 
        headerName: 'Task Force Member', 
        width: 150,
        renderCell: (params) => String(params.value || '').trim().toLowerCase() === 'yes' ? 'Yes' : 'No'
    },
    { 
        field: 'StatusNoida', 
        headerName: 'VAPT Team Member', 
        width: 130,
        // show "Yes" / "No" instead of "True"/"False"
        renderCell: (params) => (params.value === true || String(params.value).toLowerCase() === 'true') ? 'Yes' : 'No'
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
    const convertToCSV = (arr) => {
        const headers = userCols.map(col => col.headerName).join(',');
        const rows = arr.map(row => 
            userCols.map(col => {
                let value = col.valueGetter ? col.valueGetter({row}) : row[col.field];
                if (col.field === 'taskForceMember') {
                    value = String(value || '').trim().toLowerCase() === 'yes' ? 'Yes' : 'No';
                } else if (col.field === 'StatusNoida') {
                    value = (value === true || String(value).toLowerCase() === 'true') ? 'Yes' : 'No';
                } else if (col.field === 'StateCordinator') {
                    value = (value === true || String(value).toLowerCase() === 'true') ? 'Yes' : 'No';
                }
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
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.text(`User Report - Filter: ${data.length} users`, 14, 10);

    const headers = [userCols.map(col => col.headerName)];
    const body = data.map(row => 
        userCols.map(col => {
            let value = col.valueGetter ? col.valueGetter({row}) : row[col.field];
            if (col.field === 'taskForceMember') {
                value = String(value || '').trim().toLowerCase() === 'yes' ? 'Yes' : 'No';
            } else if (col.field === 'StatusNoida') {
                value = (value === true || String(value).toLowerCase() === 'true') ? 'Yes' : 'No';
            } else if (col.field === 'StateCordinator') {
                value = (value === true || String(value).toLowerCase() === 'true') ? 'Yes' : 'No';
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

    // new state: which user subset to show in list
    // default to state coordinators as requested
    const [selectedUserFilter, setSelectedUserFilter] = useState('stateCoordinator'); // 'all' | 'taskForce' | 'vapt' | 'stateCoordinator'
    const gridRef = useRef(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
           const res = await getLoginList({ page: 1, limit: 10000, search: '' });
            const all = res?.data?.data || [];
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

    // --- Right Content Stats Array (clickable) ---
    const stats = [
        { key: 'all', title: "Total Users", value: totalUsers },
        { key: 'taskForce', title: "Task Force User", value: taskForceYes},
        { key: 'vapt', title: "VAPT User", value: statusNoidaCount },       
        { key: 'stateCoordinator', title: "State Coordinator", value: StateCordinatorCount},
    ];
    
    // --- Filtering Logic --- (directorate & search first, then selectedUserFilter)
    let filteredUsers = users;

    if (selectedDirectorate !== 'All') {
        filteredUsers = filteredUsers.filter(u => {
            const dir = u.dir || u.directrate || 'Unknown';
            return dir === selectedDirectorate;
        });
    }
    filteredUsers = getFilteredRows(filteredUsers, search);

    // apply selectedUserFilter
    if (selectedUserFilter === 'taskForce') {
        filteredUsers = filteredUsers.filter(u => String(u.taskForceMember || '').trim().toLowerCase() === 'yes');
    } else if (selectedUserFilter === 'vapt') {
        filteredUsers = filteredUsers.filter(u => u.StatusNoida === true || String(u.StatusNoida).toLowerCase() === 'true');
    } else if (selectedUserFilter === 'stateCoordinator') {
        filteredUsers = filteredUsers.filter(u => u.StateCordinator === true || String(u.StateCordinator).toLowerCase() === 'true');
    } // 'all' => no additional filter

    // helper to handle stat card click: set filter, reset directorate to All and scroll to grid
    const onStatCardClick = (key) => {
        setSelectedUserFilter(key);
        setSelectedDirectorate('All');
        setSearch('');
        // scroll to grid
        if (gridRef.current) {
            gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <>
            <Stack direction="row" spacing={2} mb={2} alignItems="center" flexWrap="wrap">
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">Users Dashboard</Typography>
                </Box>
                <Box sx={{ flex: 1 }} />
            </Stack>

            <div className="dashboard-wrapper" >
                <aside className="left-sidebar">
                    <h5 className="left-title">Directorate Wise Users</h5>
                    <div className="left-scroll">
                        <Card
                            className="mb-2 left-item"
                            onClick={() => { setSelectedDirectorate('All'); setSelectedUserFilter('all'); }}
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
                                      <Card   key={s.key} className="stat-card" onClick={() => onStatCardClick(s.key)}>
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
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1 }}>
                User Details ({selectedDirectorate !== 'All' ? selectedDirectorate : (selectedUserFilter === 'all' ? 'All Users' : selectedUserFilter === 'taskForce' ? 'Task Force Users' : selectedUserFilter === 'vapt' ? 'VAPT Users' : 'State Coordinators')})
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

            <Box sx={{ height: 400 }} ref={gridRef}>
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