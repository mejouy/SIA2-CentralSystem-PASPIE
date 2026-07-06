import React, { useEffect, useState } from 'react';
import generateIntegrationPDF from '../utils/reportGenerator';
import { 
  Typography, Grid, Card, CardContent, 
  Box, Chip, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, CircularProgress, Button,
  Divider, CardHeader, Avatar
} from '@mui/material';

import { 
  Hub, CloudDone, CloudOff, Refresh,
  Campaign, FindInPage, ReportProblem, EventSeat, ListAlt, Assessment
} from '@mui/icons-material';

const CHOSEN_SUBSYSTEMS = [
  { id: 'Announcements', label: 'City Announcements', icon: <Campaign />, leader: 'Jerulyn' },
  { id: 'LostAndFound', label: 'Lost & Found System', icon: <FindInPage />, leader: 'Jerome' },
  { id: 'Complaints', label: 'Citizen Complaints', icon: <ReportProblem />, leader: 'Jimwel' },
  { id: 'FacilityReservation', label: 'Public Facility Reservations', icon: <EventSeat />, leader: 'Sheila' },
];

export default function AdminDashboard() {
  const [data, setData] = useState({ systems: [], recentActivity: [] });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchMetrics = () => {
    setLoading(true);
    fetch('/api/integration/summary')
      .then(res => res.json())
      .then(resData => {
        if (resData.success) setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Sync read fail:", err);
        setLoading(false);
      });
  };

  useEffect(() => { fetchMetrics(); }, []);

  const handleGenerateReport = () => {
    setGenerating(true);
    fetch('/api/reports/city-summary')
      .then(res => {
        if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
        return res.json();
      })
      .then(resData => {
        if (resData.success) {
          const chosenMap = CHOSEN_SUBSYSTEMS.reduce((acc, s) => { acc[s.id] = s.label; return acc; }, {});
          // merge server response with local systems and mappings for richer PDF
          const payload = {
            ...resData,
            systems: data.systems,
            recentActivity: resData.recentActivity || [],
            chosenMap
          };
          try {
            generateIntegrationPDF(payload, { generatedBy: 'Administrator' });
          } catch (e) {
            console.error('PDF generation failed', e);
            alert('Failed to generate PDF report.');
          }
        }
        setGenerating(false);
      })
      .catch(err => {
        console.error("Report compilation error:", err.message || err);
        alert(`Failed to generate report: ${err.message || "Internal Server Error"}`);
        setGenerating(false);
      });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
        <CircularProgress size={50} thickness={4.5} />
      </Box>
    );
  }

  const mappedSystems = CHOSEN_SUBSYSTEMS.map(staticSys => {
    const liveData = data.systems.find(s => s.systemName === staticSys.id);
    return {
      ...staticSys,
      isOnline: liveData ? liveData.isOnline : false,
      totalRecordsCount: liveData ? liveData.totalRecordsCount : 0,
      lastHeartbeat: liveData ? liveData.lastHeartbeat : null
    };
  });

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f4f6f8', p: { xs: 2, md: 4 }, boxSizing: 'border-box', margin: 0 }}>
      
      {/* Top Application Header Layout — Fixed alignment grid columns */}
      <Grid container spacing={3} sx={{ mb: 4, width: '100%', ml: 0, mt: 0, justifyContent: 'space-between', alignItems: 'center' }}>
        <Grid sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 0 }}>
          <Avatar sx={{ bgcolor: '#1e293b', width: 56, height: 56, boxShadow: '0 4px 12px rgba(30,41,59,0.15)' }}>
            <Hub sx={{ fontSize: 32, color: '#38bdf8' }} />
          </Avatar>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="h4" fontWeight="800" letterSpacing="-0.5px" color="#1e293b">
              Smart City Admin Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="500">
              Centralized Systems Integration Control Core (SIA 2)
            </Typography>
          </Box>
        </Grid>
        
        {/* Fixed Action Button Stack Block */}
        <Grid sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, ml: 'auto', p: 0 }}>
          <Button 
            startIcon={<Refresh />} 
            variant="contained" 
            onClick={fetchMetrics}
            sx={{ 
              borderRadius: 2.5, px: 3, fontWeight: '700', textTransform: 'none', 
              boxShadow: '0 4px 12px rgba(25,118,210,0.2)', height: '42px', bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' }
            }}
          >
            Refresh Streams
          </Button>
        </Grid>
      </Grid>

      {/* Subsystems Display Grid */}
      <Typography variant="subtitle1" fontWeight="800" color="#475569" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.85rem' }}>
        <Hub fontSize="small" sx={{ color: '#1976d2' }} /> Cluster Subsystem Nodes
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4, width: '100%', ml: 0, mt: 0 }}>
        {mappedSystems.map((sys) => (
          <Grid key={sys.id} xs={12} sm={6} md={3} sx={{ p: 1.5 }}>
            <Card variant="outlined" sx={{ borderRadius: 4, bgcolor: '#ffffff', border: '1px solid #e2e8f0', transition: 'all 0.25s ease', height: '100%', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(148,163,184,0.15)', borderColor: '#1976d2' } }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: sys.isOnline ? '#ecfdf5' : '#f1f5f9', color: sys.isOnline ? '#059669' : '#64748b', width: 44, height: 44 }}>
                    {sys.icon}
                  </Avatar>
                }
                title={<Typography variant="subtitle1" fontWeight="700" color="#1e293b" sx={{ textAlign: 'left', lineHeight: 1.3 }}>{sys.label}</Typography>}
                subheader={<Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left', fontSize: '0.8rem', fontWeight: '500' }}>Owner: {sys.leader}</Typography>}
                sx={{ pb: 1.5 }}
              />
              <Divider sx={{ borderColor: '#f1f5f9' }} />
              <CardContent sx={{ pt: 2, pb: '20px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="#64748b" fontWeight="500">Network State</Typography>
                  <Chip 
                    icon={sys.isOnline ? <CloudDone style={{ color: '#059669' }} /> : <CloudOff style={{ color: '#64748b' }} />} 
                    label={sys.isOnline ? "CONNECTED" : "OFFLINE"} 
                    size="small"
                    sx={{ borderRadius: '8px', fontWeight: '700', fontSize: '0.75rem', bgcolor: sys.isOnline ? '#d1fae5' : '#e2e8f0', color: sys.isOnline ? '#065f46' : '#334155', '& .MuiChip-icon': { fontSize: '16px' } }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="#64748b" fontWeight="500">Synced Ingestions</Typography>
                  <Typography variant="h6" fontWeight="800" color={sys.totalRecordsCount > 0 ? "#1976d2" : "#1e293b"}>
                    {sys.totalRecordsCount}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Executive Report Generation Center */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, bgcolor: '#ffffff', border: '1px solid #e2e8f0', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="subtitle1" fontWeight="700" color="#1e293b">
            Administrative Management & Reporting Engine
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight="500">
            Compile global subsystem connection signatures, metrics, and transaction integrity checks into a printable PDF document layout.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Assessment />}
          onClick={handleGenerateReport}
          disabled={generating}
          sx={{ 
            fontWeight: '700', textTransform: 'none', borderRadius: 2.5, px: 4, height: '42px', bgcolor: '#475569',
            boxShadow: '0 4px 12px rgba(71,85,105,0.2)', '&:hover': { bgcolor: '#334155' }
          }}
        >
          {generating ? 'Compiling PDF Summary...' : 'Download PDF Summary'}
        </Button>
      </Paper>

      {/* Real-time Integration Log Gateway Section */}
      <Typography variant="subtitle1" fontWeight="800" color="#475569" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.85rem' }}>
        <ListAlt fontSize="small" sx={{ color: '#1976d2' }} /> Central Log Gateway
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: '700', color: '#475569', py: 2 }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: '700', color: '#475569', py: 2 }}>Origin Subsystem</TableCell>
              <TableCell sx={{ fontWeight: '700', color: '#475569', py: 2 }}>Gateway Status</TableCell>
              <TableCell sx={{ fontWeight: '700', color: '#475569', py: 2 }}>Payload Signature</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.recentActivity.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary" fontStyle="italic" fontWeight="500">
                    No stream activity intercepted yet. Waiting for member node handshakes...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.recentActivity.map((log) => (
                <TableRow key={log._id} hover>
                  <TableCell sx={{ color: '#64748b', fontWeight: '500' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '700', color: '#1e293b', textAlign: 'left' }}>
                    {CHOSEN_SUBSYSTEMS.find(sys => sys.id === log.systemName)?.label || log.systemName.replace(/([A-Z])/g, ' $1').trim()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={log.status} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: '700', borderRadius: '6px', fontSize: '0.7rem', color: log.status === 'SUCCESS' ? '#047857' : '#b91c1c', borderColor: log.status === 'SUCCESS' ? '#a7f3d0' : '#fecaca', bgcolor: log.status === 'SUCCESS' ? '#f0fdf4' : '#fef2f2' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box component="code" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', bgcolor: '#f1f5f9', p: '4px 8px', borderRadius: 1.5, color: '#334155', display: 'inline-block', maxWidth: '450px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {JSON.stringify(log.payloadReceived?.summaryData || {})}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}