import React, { useEffect, useState } from 'react';
import { 
  Typography, Grid, Card, CardContent, 
  Box, Chip, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, CircularProgress, Button,
  Divider, CardHeader, Avatar
} from '@mui/material';

import { 
  Hub, CloudDone, CloudOff, Refresh, 
  Campaign, FindInPage, ReportProblem, EventSeat, ListAlt 
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

  const fetchMetrics = () => {
    fetch('/api/integration/summary')
      .then(res => res.json())
      .then(resData => {
        if (resData.success) setData(resData);
        setLoading(false);
      })
      .catch(err => console.error("Sync read fail:", err));
  };

  useEffect(() => { fetchMetrics(); }, []);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh', 
          bgcolor: '#f8f9fa' 
        }}
      >
        <CircularProgress size={50} />
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
    <Box 
      sx={{ 
        width: '100%',
        minHeight: '100vh', 
        bgcolor: '#f8f9fa', 
        p: 4,
        boxSizing: 'border-box',
        margin: 0
      }}
    >
      {/* Top Application Header */}
      <Box 
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          mb: 4
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, boxShadow: 2 }}>
            <Hub sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="800" letterSpacing="-0.5px">
              Smart City Admin Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Smart City: Integrated Urban Services System
            </Typography>
          </Box>
        </Box>
        <Button 
          startIcon={<Refresh />} 
          variant="contained" 
          onClick={fetchMetrics}
          sx={{ borderRadius: 2, px: 3, fontWeight: 'bold', textTransform: 'none', boxShadow: 2, height: '40px' }}
        >
          Refresh Streams
        </Button>
      </Box>

      {/* Subsystems Display Grid */}
      <Typography variant="h6" fontWeight="700" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Hub fontSize="small" color="primary" /> Cluster Subsystem Nodes
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 5, width: '100%', margin: 0 }}>
        {mappedSystems.map((sys) => (
          <Grid item xs={12} sm={6} md={3} key={sys.id} sx={{ pt: '0px !important', pl: '0px !important', pr: '24px' }}>
            <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: '#ffffff', transition: '0.2s', height: '100%', '&:hover': { boxShadow: 4, borderColor: 'primary.main' } }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: sys.isOnline ? 'success.light' : 'grey.100', color: sys.isOnline ? 'success.dark' : 'grey.600' }}>
                    {sys.icon}
                  </Avatar>
                }
                title={<Typography variant="subtitle1" fontWeight="700" sx={{ textAlign: 'left' }}>{sys.label}</Typography>}
                subheader={<Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>Owner: {sys.leader}</Typography>}
                sx={{ pb: 1.5 }}
              />
              <Divider />
              <CardContent sx={{ pt: 2, pb: '16px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Network State</Typography>
                  <Chip 
                    icon={sys.isOnline ? <CloudDone /> : <CloudOff />} 
                    label={sys.isOnline ? "CONNECTED" : "OFFLINE"} 
                    color={sys.isOnline ? "success" : "default"} 
                    size="small"
                    sx={{ borderRadius: '6px', fontWeight: 'bold' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Synced Ingestions</Typography>
                  <Typography variant="body1" fontWeight="800" color={sys.totalRecordsCount > 0 ? "primary.main" : "text.primary"}>
                    {sys.totalRecordsCount}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Real-time Integration Log Gateway Section */}
      <Typography variant="h6" fontWeight="700" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ListAlt fontSize="small" color="primary" /> Central Log Gateway
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: '#ffffff', width: '100%' }}>
        <Table>
          <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[50] }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Origin Subsystem</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Gateway Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Payload Signature</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.recentActivity.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    No stream activity intercepted yet. Waiting for member node handshakes...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.recentActivity.map((log) => (
                <TableRow key={log._id} hover>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>
                    {log.systemName.replace(/([A-Z])/g, ' $1').trim()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={log.status} 
                      color={log.status === 'SUCCESS' ? 'success' : 'error'} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: 'bold', borderRadius: '4px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box component="code" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', bgcolor: 'grey.100', p: 0.5, borderRadius: 1, display: 'inline-block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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