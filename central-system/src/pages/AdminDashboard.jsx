import React, { useEffect, useState } from 'react';
import generateIntegrationPDF from '../utils/reportGenerator';
import { apiUrl } from '../utils/api';
import {
  Typography, Grid, Card, CardContent,
  Box, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Button,
  Divider, CardHeader, Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Stack
} from '@mui/material';

import {
  Hub, CloudDone, CloudOff, Refresh, Logout, Close,
  Campaign, FindInPage, ReportProblem, EventSeat, ListAlt, Assessment
} from '@mui/icons-material';

const CHOSEN_SUBSYSTEMS = [
  {
    id: 'Announcements',
    label: 'City Announcements',
    icon: <Campaign />,
    leader: 'Jerulyn',
    description: 'Publishes official notices, advisories, and events from city hall to residents, and pushes updates into the shared activity feed the moment they go live.'
  },
  {
    id: 'LostAndFound',
    label: 'Lost & Found System',
    icon: <FindInPage />,
    leader: 'Jerome',
    description: 'Lets residents report and search for lost or found items across city facilities, and matches reports so staff can reunite owners with their belongings.'
  },
  {
    id: 'Complaints',
    label: 'Citizen Complaints',
    icon: <ReportProblem />,
    leader: 'Jimwel',
    description: 'Collects and tracks citizen complaints and service requests, routing each one to the right department and logging its status until it is resolved.'
  },
  {
    id: 'FacilityReservation',
    label: 'Public Facility Reservations',
    icon: <EventSeat />,
    leader: 'Sheila',
    description: 'Manages bookings for public facilities such as courts, halls, and parks, checking availability and confirming reservations for residents.'
  },
];

// ---- Design tokens -------------------------------------------------------
// Civic / municipal identity: a calm navy authority color on a warm neutral
// background, borrowed from official city letterheads rather than a generic
// SaaS admin palette. Status is read through simple color, not motion.
const COLOR = {
  bg: '#F6F7F9',
  panel: '#FFFFFF',
  panelTint: '#EEF2F6',
  border: '#E1E5EA',
  navy: '#1B3A5C',
  navyDark: '#132A44',
  success: '#2F8F5B',
  successBg: '#EAF6EF',
  danger: '#C0392B',
  dangerBg: '#FBEAE8',
  neutral: '#8A93A3',
  neutralBg: '#F0F1F3',
  textPrimary: '#1A2332',
  textSecondary: '#5B6472',
  textMuted: '#8A93A3',
};

const FONT_DISPLAY = "'IBM Plex Sans', 'Segoe UI', sans-serif";
const FONT_BODY = "'IBM Plex Sans', 'Segoe UI', sans-serif";
const FONT_MONO = "'IBM Plex Mono', 'Roboto Mono', monospace";

export default function AdminDashboard() {
  const [data, setData] = useState({ systems: [], recentActivity: [] });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState(null);

  const fetchMetrics = () => {
    setLoading(true);
    fetch(apiUrl('/api/integration/summary'))
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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    window.location.reload();
  };

  const handleGenerateReport = () => {
    setGenerating(true);
    fetch(apiUrl('/api/reports/city-summary'))
      .then(res => {
        if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
        return res.json();
      })
      .then(resData => {
        if (resData.success) {
          const chosenMap = CHOSEN_SUBSYSTEMS.reduce((acc, s) => { acc[s.id] = s.label; return acc; }, {});
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

  const mappedSystems = CHOSEN_SUBSYSTEMS.map(staticSys => {
    const liveData = data.systems.find(s => s.systemName === staticSys.id);
    return {
      ...staticSys,
      isOnline: liveData ? liveData.isOnline : false,
      totalRecordsCount: liveData ? liveData.totalRecordsCount : 0,
      lastHeartbeat: liveData ? liveData.lastHeartbeat : null
    };
  });

  const onlineCount = mappedSystems.filter(s => s.isOnline).length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: COLOR.bg }}>
        <CircularProgress size={44} thickness={4} sx={{ color: COLOR.navy }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: COLOR.bg, boxSizing: 'border-box', margin: 0, fontFamily: FONT_BODY }}>

      {/* Letterhead strip */}
      <Box sx={{ height: 4, width: '100%', bgcolor: COLOR.navy }} />

      <Box sx={{ p: { xs: 2, md: 4 } }}>

        {/* Header */}
        <Box sx={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center',
          gap: 2, mb: 4, pb: 3, borderBottom: `1px solid ${COLOR.border}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar variant="rounded" sx={{ bgcolor: COLOR.navy, width: 48, height: 48, borderRadius: 1.5 }}>
              <Hub sx={{ fontSize: 26, color: '#fff' }} />
            </Avatar>
            <Box sx={{ textAlign: 'left' }}>
              <Typography sx={{
                fontFamily: FONT_MONO, color: COLOR.textMuted, fontSize: '0.68rem',
                letterSpacing: '1.5px', textTransform: 'uppercase', mb: 0.25
              }}>
                Systems Integration &amp; Architecture
              </Typography>
              <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: { xs: '1.3rem', md: '1.55rem' }, color: COLOR.textPrimary, letterSpacing: '-0.2px' }}>
                Smart City Admin Dashboard
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1, px: 1.75, py: 0.9,
              border: `1px solid ${COLOR.border}`, borderRadius: 1.5, bgcolor: COLOR.panel
            }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: onlineCount === mappedSystems.length ? COLOR.success : COLOR.neutral }} />
              <Typography sx={{ fontFamily: FONT_MONO, fontSize: '0.74rem', color: COLOR.textSecondary }}>
                {onlineCount} of {mappedSystems.length} systems online
              </Typography>
            </Box>
            <Button
              startIcon={<Refresh />}
              onClick={fetchMetrics}
              variant="contained"
              disableElevation
              sx={{
                borderRadius: 1.5, px: 2.5, height: 40, fontWeight: 600, textTransform: 'none',
                fontFamily: FONT_BODY, bgcolor: COLOR.navy,
                '&:hover': { bgcolor: COLOR.navyDark }
              }}
            >
              Refresh
            </Button>
            <Button
              startIcon={<Logout />}
              onClick={handleLogout}
              variant="outlined"
              sx={{
                borderRadius: 1.5, px: 2.5, height: 40, fontWeight: 600, textTransform: 'none',
                fontFamily: FONT_BODY, color: COLOR.textSecondary, borderColor: COLOR.border,
                '&:hover': { borderColor: COLOR.danger, color: COLOR.danger, bgcolor: COLOR.dangerBg }
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>

        {/* Subsystem nodes */}
        <Typography sx={{
          fontFamily: FONT_MONO, color: COLOR.textMuted, fontSize: '0.7rem',
          letterSpacing: '1.5px', textTransform: 'uppercase', mb: 2, display: 'flex', alignItems: 'center', gap: 1
        }}>
          <Hub sx={{ fontSize: 14, color: COLOR.navy }} /> Cluster Subsystem Nodes
        </Typography>

        <Grid container spacing={2.5} sx={{ mb: 4, width: '100%', ml: 0, mt: 0 }}>
          {mappedSystems.map((sys) => (
            <Grid key={sys.id} xs={12} sm={6} md={3} sx={{ p: 1.25 }}>
              <Card
                onClick={() => setSelectedSystem(sys)}
                sx={{
                  borderRadius: 2, bgcolor: COLOR.panel, border: `1px solid ${COLOR.border}`,
                  borderLeft: `3px solid ${sys.isOnline ? COLOR.success : COLOR.neutral}`,
                  transition: 'box-shadow 0.15s ease, transform 0.15s ease', height: '100%',
                  cursor: 'pointer',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(27,58,92,0.08)' },
                  '&:focus-visible': { outline: `2px solid ${COLOR.navy}`, outlineOffset: 2 }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${sys.label}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedSystem(sys); } }}
              >
                <CardHeader
                  avatar={
                    <Avatar variant="rounded" sx={{
                      bgcolor: sys.isOnline ? COLOR.successBg : COLOR.neutralBg,
                      color: sys.isOnline ? COLOR.success : COLOR.neutral,
                      width: 40, height: 40, borderRadius: 1.25
                    }}>
                      {sys.icon}
                    </Avatar>
                  }
                  title={
                    <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: '0.92rem', color: COLOR.textPrimary, textAlign: 'left' }}>
                      {sys.label}
                    </Typography>
                  }
                  subheader={
                    <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem', color: COLOR.textMuted, textAlign: 'left' }}>
                      Owner: {sys.leader}
                    </Typography>
                  }
                  sx={{ pb: 1 }}
                />
                <Divider sx={{ borderColor: COLOR.border }} />
                <CardContent sx={{ pt: 1.75, pb: '16px !important' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.78rem', color: COLOR.textSecondary }}>
                      Link state
                    </Typography>
                    <Chip
                      icon={sys.isOnline ? <CloudDone sx={{ fontSize: 14, color: `${COLOR.success} !important` }} /> : <CloudOff sx={{ fontSize: 14, color: `${COLOR.neutral} !important` }} />}
                      label={sys.isOnline ? "Connected" : "Offline"}
                      size="small"
                      sx={{
                        borderRadius: '6px', fontWeight: 600, fontSize: '0.7rem', fontFamily: FONT_BODY,
                        bgcolor: sys.isOnline ? COLOR.successBg : COLOR.neutralBg,
                        color: sys.isOnline ? COLOR.success : COLOR.textSecondary,
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.78rem', color: COLOR.textSecondary }}>
                      Records synced
                    </Typography>
                    <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: '1.2rem', color: sys.totalRecordsCount > 0 ? COLOR.navy : COLOR.textMuted }}>
                      {sys.totalRecordsCount}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Report generation */}
        <Paper sx={{
          p: 3, mb: 4, borderRadius: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2,
          bgcolor: COLOR.panelTint, border: `1px solid ${COLOR.border}`
        }}>
          <Box sx={{ textAlign: 'left' }}>
            <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: '1rem', color: COLOR.textPrimary }}>
              Compile city-wide integration summary
            </Typography>
            <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.82rem', color: COLOR.textSecondary, mt: 0.5 }}>
              Bundles connection status, node metrics, and transaction checks into a printable PDF report.
            </Typography>
          </Box>
          <Button
            startIcon={<Assessment />}
            onClick={handleGenerateReport}
            disabled={generating}
            variant="contained"
            disableElevation
            sx={{
              fontWeight: 600, textTransform: 'none', borderRadius: 1.5, px: 3, height: 42,
              fontFamily: FONT_BODY, bgcolor: COLOR.navy, whiteSpace: 'nowrap',
              '&:hover': { bgcolor: COLOR.navyDark },
              '&.Mui-disabled': { bgcolor: COLOR.neutralBg, color: COLOR.textMuted }
            }}
          >
            {generating ? 'Compiling summary…' : 'Download PDF summary'}
          </Button>
        </Paper>

        {/* Log gateway */}
        <Typography sx={{
          fontFamily: FONT_MONO, color: COLOR.textMuted, fontSize: '0.7rem',
          letterSpacing: '1.5px', textTransform: 'uppercase', mb: 2, display: 'flex', alignItems: 'center', gap: 1
        }}>
          <ListAlt sx={{ fontSize: 14, color: COLOR.navy }} /> Central Log Gateway
        </Typography>

        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: COLOR.panel, border: `1px solid ${COLOR.border}` }}>
          <Table>
            <TableHead sx={{ backgroundColor: COLOR.panelTint }}>
              <TableRow>
                {['Timestamp', 'Origin Subsystem', 'Gateway Status', 'Payload Signature'].map(h => (
                  <TableCell key={h} sx={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.5px', textTransform: 'uppercase', color: COLOR.textSecondary, borderColor: COLOR.border, py: 1.75 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.recentActivity.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8, borderColor: COLOR.border }}>
                    <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.85rem', color: COLOR.textMuted, fontStyle: 'italic' }}>
                      No stream activity intercepted yet. Waiting for member node handshakes&hellip;
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.recentActivity.map((log) => (
                  <TableRow key={log._id} hover sx={{ '&:hover': { bgcolor: COLOR.panelTint } }}>
                    <TableCell sx={{ fontFamily: FONT_MONO, fontSize: '0.78rem', color: COLOR.textSecondary, borderColor: COLOR.border }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: '0.85rem', color: COLOR.textPrimary, textAlign: 'left', borderColor: COLOR.border }}>
                      {CHOSEN_SUBSYSTEMS.find(sys => sys.id === log.systemName)?.label || log.systemName.replace(/([A-Z])/g, ' $1').trim()}
                    </TableCell>
                    <TableCell sx={{ borderColor: COLOR.border }}>
                      <Chip
                        label={log.status}
                        size="small"
                        sx={{
                          fontWeight: 600, fontFamily: FONT_BODY, borderRadius: '6px', fontSize: '0.7rem',
                          color: log.status === 'SUCCESS' ? COLOR.success : COLOR.danger,
                          bgcolor: log.status === 'SUCCESS' ? COLOR.successBg : COLOR.dangerBg,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderColor: COLOR.border }}>
                      <Box component="code" sx={{
                        fontFamily: FONT_MONO, fontSize: '0.75rem', bgcolor: COLOR.panelTint, p: '4px 10px',
                        borderRadius: 1.5, color: COLOR.textSecondary, display: 'inline-block',
                        maxWidth: '450px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        border: `1px solid ${COLOR.border}`
                      }}>
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

      {/* Subsystem detail dialog */}
      <Dialog
        open={Boolean(selectedSystem)}
        onClose={() => setSelectedSystem(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 2.5, border: `1px solid ${COLOR.border}` } }}
      >
        {selectedSystem && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 6 }}>
              <Avatar variant="rounded" sx={{
                bgcolor: selectedSystem.isOnline ? COLOR.successBg : COLOR.neutralBg,
                color: selectedSystem.isOnline ? COLOR.success : COLOR.neutral,
                width: 40, height: 40, borderRadius: 1.25
              }}>
                {selectedSystem.icon}
              </Avatar>
              <Box sx={{ textAlign: 'left' }}>
                <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: '1.05rem', color: COLOR.textPrimary }}>
                  {selectedSystem.label}
                </Typography>
                <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem', color: COLOR.textMuted }}>
                  Owner: {selectedSystem.leader}
                </Typography>
              </Box>
              <IconButton
                onClick={() => setSelectedSystem(null)}
                sx={{ position: 'absolute', right: 12, top: 12, color: COLOR.textMuted }}
              >
                <Close fontSize="small" />
              </IconButton>
            </DialogTitle>

            <Divider sx={{ borderColor: COLOR.border }} />

            <DialogContent sx={{ pt: 2.5 }}>
              <Typography sx={{
                fontFamily: FONT_MONO, color: COLOR.textMuted, fontSize: '0.68rem',
                letterSpacing: '1.5px', textTransform: 'uppercase', mb: 0.75
              }}>
                What it does
              </Typography>
              <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.88rem', color: COLOR.textSecondary, lineHeight: 1.6, mb: 3 }}>
                {selectedSystem.description}
              </Typography>

              <Stack direction="row" spacing={1.5}>
                <Box sx={{ flex: 1, p: 1.5, borderRadius: 1.5, bgcolor: COLOR.panelTint, border: `1px solid ${COLOR.border}` }}>
                  <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.72rem', color: COLOR.textSecondary, mb: 0.5 }}>
                    Link state
                  </Typography>
                  <Chip
                    icon={selectedSystem.isOnline ? <CloudDone sx={{ fontSize: 14, color: `${COLOR.success} !important` }} /> : <CloudOff sx={{ fontSize: 14, color: `${COLOR.neutral} !important` }} />}
                    label={selectedSystem.isOnline ? "Connected" : "Offline"}
                    size="small"
                    sx={{
                      borderRadius: '6px', fontWeight: 600, fontSize: '0.7rem', fontFamily: FONT_BODY,
                      bgcolor: selectedSystem.isOnline ? COLOR.successBg : COLOR.neutralBg,
                      color: selectedSystem.isOnline ? COLOR.success : COLOR.textSecondary,
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1, p: 1.5, borderRadius: 1.5, bgcolor: COLOR.panelTint, border: `1px solid ${COLOR.border}` }}>
                  <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.72rem', color: COLOR.textSecondary, mb: 0.5 }}>
                    Records synced
                  </Typography>
                  <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: '1.1rem', color: selectedSystem.totalRecordsCount > 0 ? COLOR.navy : COLOR.textMuted }}>
                    {selectedSystem.totalRecordsCount}
                  </Typography>
                </Box>
              </Stack>

              {selectedSystem.lastHeartbeat && (
                <Typography sx={{ fontFamily: FONT_MONO, fontSize: '0.72rem', color: COLOR.textMuted, mt: 2 }}>
                  Last heartbeat: {new Date(selectedSystem.lastHeartbeat).toLocaleString()}
                </Typography>
              )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button
                onClick={() => setSelectedSystem(null)}
                variant="outlined"
                sx={{
                  textTransform: 'none', fontWeight: 600, borderRadius: 1.5,
                  fontFamily: FONT_BODY, color: COLOR.textSecondary, borderColor: COLOR.border
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}