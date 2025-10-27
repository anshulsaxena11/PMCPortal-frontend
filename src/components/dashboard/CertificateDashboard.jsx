import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, TextField, Stack, Button } from '@mui/material';
import { Card } from 'react-bootstrap';
import CustomDataGrid from '../../components/DataGrid/CustomDataGrid';
import { getCertificateDetailsList } from '../../api/certificateApi/certificate';
import { getCertificateMasterList } from '../../api/certificateMaster/certificateMaster';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// --- DataGrid Columns for Certificates ---
const certificateCols = [
    { field: 'sno', headerName: 'S.No', width: 80 },
    { field: 'certificateName', headerName: 'Certificate', flex: 1 },
    { field: 'assignedPerson', headerName: 'User', flex: 1 },
    { field: 'issuedDate', headerName: 'Issued Date', width: 140 },
    { field: 'validUpto', headerName: 'Expiry Date', width: 140 },
    {
        field: 'status',
        headerName: 'Status',
        width: 140,
        renderCell: (params) => {
            const exp = params.row.expiryDate ? new Date(params.row.expiryDate) : null;
            const now = new Date();
            const isExpired = exp && exp < now;
            if (isExpired) return 'Expired';
            return String(params.value || '').length ? params.value : 'Active';
        }
    },
];
// ----------------------------------------------------

function getFilteredRows(rows, term) {
    const lower = String(term || '').toLowerCase().trim();
    if (!lower) return rows;
    return rows.filter((row) =>
        Object.values(row).some(
            (val) => String(val || "").toLowerCase().includes(lower)
        )
    );
}

const exportToCsv = (data, filename = 'certificates') => {
    const headers = certificateCols.map(c => c.headerName).join(',');
    const rows = data.map(row =>
        certificateCols.map(col => {
            const v = String(row[col.field] ?? '').replace(/"/g, '""');
            return `"${v}"`;
        }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const exportToPdf = (data, filename = 'certificates') => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const headers = [certificateCols.map(c => c.headerName)];
    const body = data.map(row => certificateCols.map(col => String(row[col.field] ?? '')));
    doc.autoTable({ head: headers, body, startY: 14, styles: { fontSize: 8 } });
    doc.save(`${filename}.pdf`);
};

// UsersDashboard-like inline styles
const statCardStyle = {
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
};
const statHeaderStyle = (bg) => ({ padding: '14px 16px', background: bg, color: '#fff', fontWeight: 600 });
const statContentStyle = { padding: '14px 16px', background: '#fff', minHeight: 72, display: 'flex', alignItems: 'center' };
const leftCardStyle = { padding: 0, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', cursor: 'pointer' };

export default function CertificateDashboard() {
    const [certificates, setCertificates] = useState([]);
    const [masterList, setMasterList] = useState([]); // certificate types
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedCertificateType, setSelectedCertificateType] = useState('All');
    const [selectedFilter, setSelectedFilter] = useState('all'); // all | expired | certified | expiring
    const gridRef = useRef(null);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const detailsRes = await getCertificateDetailsList({ page: 1, limit: 10000, search: '' });
            const details = detailsRes?.data || [];
            const processed = details.map((c, i) => ({
                ...c,
                id: c._id || i + 1,
                sno: i + 1,
                certificateName: c.certificateName || c.name || c.title || 'Certificate',
                assignedPerson: c.assignedPerson || c.assignedPerson || c.assignedPerson || c.assignedPerson || 'N/A',
                userId: c.userId || c.user_id || c.empId || '',
                issuedDate: c.issuedDate ? new Date(c.issuedDate).toISOString() : (c.issueDate ? new Date(c.issueDate).toISOString() : ''),
                validUpto: c.validUpto ? new Date(c.validUpto).toISOString() : (c.validTill ? new Date(c.validTill).toISOString() : ''),
                status: c.status || (c.isCertified ? 'Certified' : '')
            }));
            setCertificates(processed);

            // master list fetch (certificate types)
            try {
                const masterRes = await getCertificateMasterList({ page: 1, limit: 10000, search: '' });
                const mdata = masterRes?.data?.data || masterRes?.data || [];
                // normalize master items to have a 'name' field
                const masters = Array.isArray(mdata) ? mdata.map(m => ({ id: m._id || m.id, name: m.name || m.certificateName || m.title || String(m).slice(0, 40) })) : [];
                setMasterList(masters);
            } catch (me) {
                // eslint-disable-next-line no-console
                console.error('master fetch error', me);
                setMasterList([]);
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Certificates fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    // Stats
    const totalCertificateTypes = masterList.length;
    const now = new Date();
    const expiredCertificates = certificates.filter(c => {
        const d = c.expiryDate ? new Date(c.expiryDate) : null;
        return d && d < now;
    }).length;
    const expiringSoon = certificates.filter(c => {
        const d = c.expiryDate ? new Date(c.expiryDate) : null;
        if (!d) return false;
        const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 30;
    }).length;
    // per request: use getCertificateDetailsList (all certificate entries) as Total Certified Users
    const totalCertifiedUsers = certificates.length;

    // Apply filters: type, stat filter, search
    let filtered = certificates.slice();
    if (selectedCertificateType !== 'All') {
        filtered = filtered.filter(c => String(c.certificateName || '').toLowerCase() === String(selectedCertificateType || '').toLowerCase());
    }
    if (selectedFilter === 'expired') {
        filtered = filtered.filter(c => { const d = c.expiryDate ? new Date(c.expiryDate) : null; return d && d < now; });
    } else if (selectedFilter === 'expiring') {
        filtered = filtered.filter(c => { const d = c.expiryDate ? new Date(c.expiryDate) : null; if (!d) return false; const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24)); return diffDays >= 0 && diffDays <= 30; });
    } else if (selectedFilter === 'certified') {
        filtered = filtered.filter(c => String(c.status || '').toLowerCase().includes('cert') || Boolean(c.isCertified));
    }
    filtered = getFilteredRows(filtered, search);

    const onStatCardClick = (key) => {
        setSelectedFilter(key);
        setSelectedCertificateType('All');
        setSearch('');
        if (gridRef.current) gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <>
            <Stack direction="row" spacing={2} mb={2} alignItems="center" flexWrap="wrap">
                <Box><Typography variant="subtitle1" fontWeight="bold">Certificates Dashboard</Typography></Box>
                <Box sx={{ flex: 1 }} />
            </Stack>

            <div className="dashboard-wrapper" >
                <aside className="left-sidebar">
                 
                    <h5 className="left-title">Certificate Types</h5>
                    <div className="left-scroll"></div>

                    
                        <Card  className="mb-2 left-item" style={{ ...leftCardStyle, background: selectedCertificateType === 'All' ? '#e6f7f5' : '#fff' }}
                              onClick={() => { setSelectedCertificateType('All'); setSelectedFilter('all'); }}>
                            <Card.Body className="py-2 px-3" >                                
                                 <div className="d-flex justify-content-between align-items-center">
                                    <div className="small"><strong>All Types ({totalCertificateTypes})</strong></div>
                                </div>
                            </Card.Body>
                        </Card>

                        {masterList.map((m) => {
                            const count = certificates.filter(c => String(c.certificateName || '').toLowerCase() === String(m.name || '').toLowerCase()).length;
                            return (
                                <Card key={m.id} className="mb-2 left-item" style={{ ...leftCardStyle, background: selectedCertificateType === (m.name || '') ? '#e6f7f5' : '#fff' }}
                                      onClick={() => { setSelectedCertificateType(m.name || ''); setSelectedFilter('all'); }}>
                                    <Card.Body className="py-2 px-3">
                                        
                                 <div className="d-flex justify-content-between align-items-center">
                                        <div className="small"><strong>{m.name}</strong></div>
                                        <div className="text-end">
                                            <div className="fw-bold">{count} Users</div>
                                        </div>
                                    </div>

                                    </Card.Body>
                                </Card>
                            );
                        })}
                    
                </aside>

                <main style={{ flex: 1 }}>
                    <h5 style={{ marginBottom: 12 }}>Overview</h5>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginBottom: 16 }}>
                        

                           <Card   className="stat-card">
                            <div className={`stat-header`}>Total Certificate Types</div>
                              <div className="stat-content">
                               <div className={`stat-value`}>{loading ? '...' : totalCertificateTypes}</div>
                              </div>
                            </Card>

                          <Card   className="stat-card" onClick={() => onStatCardClick('expired')}>
                            <div className={`stat-header`}>Expired Certificates</div>
                              <div className="stat-content">
                               <div className={`stat-value`}>{loading ? '...' : expiredCertificates}</div>
                              </div>
                            </Card>
                            <Card   className="stat-card" onClick={() => onStatCardClick('all')}>
                            <div className={`stat-header`}>Total Certified Users</div>
                              <div className="stat-content">
                               <div className={`stat-value`}>{loading ? '...' : totalCertifiedUsers}</div>
                              </div>
                            </Card>
                         <Card   className="stat-card" onClick={() => onStatCardClick('expiring')}>
                            <div className={`stat-header`}>Expiring Soon (30d)</div>
                              <div className="stat-content">
                               <div className={`stat-value`}>{loading ? '...' : expiringSoon}</div>
                              </div>
                            </Card>
                        </div>
                     </main>
            </div>

                    <Typography variant="h6" gutterBottom sx={{ mt: 1, mb: 1 }}>
                        Certificate Details ({ selectedCertificateType !== 'All' ? selectedCertificateType : (selectedFilter === 'all' ? 'All' : selectedFilter) })
                    </Typography>

                    <Stack direction="row" spacing={2} mb={2} alignItems="center" flexWrap="wrap">
                        {/* Dropdown to select certificate type (left of search) */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            
                            <select
                                value={selectedCertificateType}
                                onChange={(e) => { setSelectedCertificateType(e.target.value); setSelectedFilter('all'); }}
                                style={{
                                    padding: '8px 10px',
                                    borderRadius: 6,
                                    minWidth: 220,
                                    height: 40,
                                    border: '1px solid #ccc',
                                    background: '#fff'
                                }}
                            >
                                <option value="All">All Types</option>
                                {masterList.map((m) => (
                                    <option key={m.id} value={m.name}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        <TextField
                            label="Search certificates..."
                            variant="outlined"
                            value={search}
                            size="small"
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ width: 300, backgroundColor: 'white', '& .MuiInputBase-root': { height: 40 } }}
                        />

                        <Box sx={{ flex: 1 }} />
                        <Button variant="contained" color="secondary" size="small" onClick={() => exportToPdf(filtered, `Certificates_${new Date().toISOString().slice(0,10)}`)}>Download PDF</Button>
                        <Button variant="contained" color="primary" size="small" onClick={() => exportToCsv(filtered, `Certificates_${new Date().toISOString().slice(0,10)}`)}>Download CSV</Button>
                    </Stack>

                    <Box sx={{ height: 440 }} ref={gridRef}>
                        <CustomDataGrid
                            rows={filtered.map((row, idx) => ({
                                ...row,
                                sno: idx + 1,
                                issuedDate: row.issuedDate ? new Date(row.issuedDate).toLocaleDateString() : '',
                                validUpto: row.validUpto ? new Date(row.validUpto).toLocaleDateString() : ''
                            }))}
                            columns={certificateCols}
                            loading={loading}
                            paginationModel={{ page, pageSize }}
                            onPaginationModelChange={({ page, pageSize }) => { setPage(page); setPageSize(pageSize); }}
                            rowCount={filtered.length}
                            paginationMode="client"
                            autoHeight
                        />
                    </Box>
               
        </>
    );
}