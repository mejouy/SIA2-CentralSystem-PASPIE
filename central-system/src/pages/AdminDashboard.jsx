import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import generateIntegrationPDF from '../utils/reportGenerator';
import { apiUrl } from '../utils/api';
import {
  Typography, Grid, Card, CardContent,
  Box, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Button,
  Divider, CardHeader, Avatar, Dialog, DialogTitle, DialogContent,
  IconButton, Stack, Select, MenuItem, FormControl, InputLabel, Alert, Tooltip
} from '@mui/material';

import {
  Hub, CloudDone, CloudOff, Refresh, Logout, Close,
  Campaign, FindInPage, ReportProblem, EventSeat, ListAlt, Assessment, DeleteSweep,
  Settings, FilterAltOff
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

// A defined type scale instead of ad hoc rem values scattered per element.
const TYPE = {
  eyebrow: { fontFamily: FONT_MONO, fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase' },
  label: { fontFamily: FONT_BODY, fontSize: '0.78rem' },
  body: { fontFamily: FONT_BODY, fontSize: '0.85rem' },
  mono: { fontFamily: FONT_MONO, fontSize: '0.78rem' },
  cardTitle: { fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: '0.92rem' },
  metric: { fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: '1.15rem' },
  sectionTitle: { fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: '1rem' },
  pageTitle: { fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: '1.4rem', letterSpacing: '-0.2px' },
  dialogTitle: { fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: '1.05rem' },
};

const SHADOW = { card: '0 6px 16px rgba(27,58,92,0.08)' };

// Branded dropdown menu paper, applied to every Select so the open menu matches the app shell
const menuPaperProps = {
  PaperProps: {
    sx: {
      mt: 0.5, borderRadius: 1.5, border: `1px solid ${COLOR.border}`,
      boxShadow: '0 8px 24px rgba(27,58,92,0.12)'
    }
  }
};

// Reusable select styling so both filter dropdowns match the app's field language
const selectSx = {
  borderRadius: 1.5, fontFamily: FONT_BODY, fontSize: '0.82rem', bgcolor: COLOR.panel,
  '& .MuiOutlinedInput-notchedOutline': { borderColor: COLOR.border },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLOR.neutral },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLOR.navy, borderWidth: '1px' },
};
const selectLabelSx = { fontFamily: FONT_BODY, fontSize: '0.82rem', '&.Mui-focused': { color: COLOR.navy } };
const menuItemSx = { fontFamily: FONT_BODY, fontSize: '0.85rem' };

// Shared button treatments so every action button in the header/toolbars reads consistently
const btnBase = {
  borderRadius: 1.5, height: 40, fontWeight: 600, textTransform: 'none', fontFamily: FONT_BODY,
};
const btnOutlinedNeutral = {
  ...btnBase, px: 2.25, color: COLOR.textSecondary, borderColor: COLOR.border,
  '&:hover': { borderColor: COLOR.navy, color: COLOR.navy, bgcolor: COLOR.panel },
};
const btnOutlinedDanger = {
  ...btnBase, px: 2.25, color: COLOR.textSecondary, borderColor: COLOR.border,
  '&:hover': { borderColor: COLOR.danger, color: COLOR.danger, bgcolor: COLOR.dangerBg },
};
const btnOutlinedNavy = {
  ...btnBase, px: 2.25, color: COLOR.navy, borderColor: COLOR.navy,
  '&:hover': { bgcolor: COLOR.navy, color: '#fff' },
};
const btnPrimary = {
  ...btnBase, px: 3, height: 42, bgcolor: COLOR.navy,
  '&:hover': { bgcolor: COLOR.navyDark },
  '&.Mui-disabled': { bgcolor: COLOR.neutralBg, color: COLOR.textMuted },
};
const iconBtnBordered = {
  width: 40, height: 40, borderRadius: 1.5, border: `1px solid ${COLOR.border}`, color: COLOR.textSecondary,
  '&:hover': { borderColor: COLOR.navy, color: COLOR.navy, bgcolor: COLOR.panel },
};

// Status chip config, kept in one place instead of duplicated per usage site
function statusChipSx(isPositive) {
  return {
    borderRadius: '6px', fontWeight: 600, fontSize: '0.7rem', fontFamily: FONT_BODY,
    bgcolor: isPositive ? COLOR.successBg : COLOR.neutralBg,
    color: isPositive ? COLOR.success : COLOR.textSecondary,
    '& .MuiChip-icon': { color: isPositive ? COLOR.success : COLOR.neutral, fontSize: 15 },
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    systems: [],
    recentActivity: [],
    breakdown: []
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Filter States for Integration Logs
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [systemFilter, setSystemFilter] = useState('ALL');
  const filtersActive = statusFilter !== 'ALL' || systemFilter !== 'ALL';

  // Dialog selection managers
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [viewingPayload, setViewingPayload] = useState(null);

  // Fetch metrics helper
  const fetchMetrics = useCallback(() => {
    setLoading(true);
    setErrorMessage(null);

    // 1. Fetch dashboard subsystem breakdown states
    const fetchStats = fetch(apiUrl('/api/city-summary')).then(res => {
      if (!res.ok) throw new Error('Failed to fetch city summary stats.');
      return res.json();
    });

    // 2. Fetch integration logs with dynamic query parameters
    let logsUrl = '/api/integration/logs';
    const params = [];
    if (statusFilter !== 'ALL') params.push(`status=${statusFilter}`);
    if (systemFilter !== 'ALL') params.push(`systemName=${systemFilter}`);
    if (params.length > 0) logsUrl += `?${params.join('&')}`;

    const fetchLogs = fetch(apiUrl(logsUrl)).then(res => {
      if (!res.ok) throw new Error('Failed to fetch integration logs.');
      return res.json();
    });

    Promise.all([fetchStats, fetchLogs])
      .then(([statsRes, logsRes]) => {
        if (statsRes.success) {
          setData({
            systems: statsRes.systems || [],
            breakdown: statsRes.breakdown || [],
            recentActivity: logsRes.success ? logsRes.logs : (statsRes.recentActivity || [])
          });
        } else {
          throw new Error(statsRes.message || "Failed to retrieve active cluster statistics.");
        }
      })
      .catch(err => {
        console.error("Dashboard sync metrics failure:", err);
        setErrorMessage(err.message || "An unexpected error occurred while syncing cluster components.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [statusFilter, systemFilter]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleClearLogs = () => {
    if (window.confirm("Are you sure you want to purge all Integration Logs from the gateway? This cannot be undone.")) {
      fetch(apiUrl('/api/integration/logs/clear'), { method: 'DELETE' })
        .then(res => res.json())
        .then(resData => {
          if (resData.success) {
            fetchMetrics();
          } else {
            alert(resData.message || "Failed to clear gateway log history.");
          }
        })
        .catch(err => console.error("Error clearing logs:", err));
    }
  };

  const resetFilters = () => {
    setStatusFilter('ALL');
    setSystemFilter('ALL');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    window.location.reload();
  };

  const handleGenerateReport = () => {
    setGenerating(true);
    fetch(apiUrl('/api/city-summary'))
      .then(res => {
        if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
        return res.json();
      })
      .then(resData => {
        if (resData.success) {
          const chosenMap = CHOSEN_SUBSYSTEMS.reduce((acc, s) => { acc[s.id] = s.label; return acc; }, {});
          const payload = {
            ...resData,
            systems: CHOSEN_SUBSYSTEMS.map(sys => {
              const liveData = resData.breakdown?.find(s => s._id === sys.id);
              return {
                systemName: sys.id,
                displayName: sys.label,
                leader: sys.leader,
                isOnline: !!liveData,
                totalRecordsCount: liveData ? liveData.totalSyncs : 0
              };
            }),
            recentActivity: data.recentActivity || [],
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
    const liveData = data.breakdown.find(s => s._id === staticSys.id);
    return {
      ...staticSys,
      isOnline: !!liveData,
      totalRecordsCount: liveData ? liveData.totalSyncs : 0,
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
      <Box sx={{ height: 4, width: '100%', bgcolor: COLOR.navy }} />

      {/* Constrained shell so the layout reads as a deliberate dashboard, not a fluid stretch */}
      <Box sx={{ maxWidth: 1440, mx: 'auto', p: { xs: 2, md: 4 } }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5, fontFamily: FONT_BODY }} onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        {/* Header — stacks to a column on mobile instead of squeezing everything into one wrapping row */}
        <Box sx={{
          display: 'flex', flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' },
          gap: 2, mb: 4, pb: 3, borderBottom: `1px solid ${COLOR.border}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar variant="rounded" sx={{ bgcolor: COLOR.navy, width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 }, borderRadius: 1.5, flexShrink: 0 }}>
              <Hub sx={{ fontSize: { xs: 22, md: 26 }, color: '#fff' }} />
            </Avatar>
            <Box sx={{ textAlign: 'left', minWidth: 0 }}>
              <Typography sx={{ ...TYPE.eyebrow, color: COLOR.textMuted, mb: 0.25, fontSize: { xs: '0.62rem', md: '0.7rem' } }}>
                Systems Integration {"&"} Architecture
              </Typography>
              <Typography sx={{ ...TYPE.pageTitle, fontSize: { xs: '1.15rem', md: '1.45rem' }, color: COLOR.textPrimary }}>
                Smart City Admin Dashboard
              </Typography>
            </Box>
          </Box>

          {/* Action cluster: [status + refresh] — monitoring utilities, grouped since they act on the same data —
              then System Management as the primary secondary action, then Logout set apart after a divider
              since it ends the session rather than acting on the dashboard. On mobile the divider drops out
              and everything wraps into a simple two-per-row grid of full-width-friendly buttons. */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap',
            justifyContent: { xs: 'space-between', md: 'flex-end' }
          }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1, pl: 1.75, pr: 0.75, height: 40,
              border: `1px solid ${COLOR.border}`, borderRadius: 1.5, bgcolor: COLOR.panel,
              flex: { xs: '1 1 100%', sm: '0 1 auto' }, order: { xs: 1, md: 0 }
            }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: onlineCount === mappedSystems.length ? COLOR.success : COLOR.neutral, flexShrink: 0 }} />
              <Typography sx={{ ...TYPE.mono, color: COLOR.textSecondary, whiteSpace: 'nowrap', flex: 1 }}>
                {onlineCount} of {mappedSystems.length} online
              </Typography>
              <Tooltip title="Reload live metrics">
                <IconButton onClick={fetchMetrics} size="small" sx={{ color: COLOR.textSecondary, '&:hover': { color: COLOR.navy } }}>
                  <Refresh fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Tooltip title="Register and manage subsystem access">
              <Button
                startIcon={<Settings fontSize="small" />}
                onClick={() => navigate('/system-management')}
                variant="outlined"
                sx={{ ...btnOutlinedNavy, flex: { xs: '1 1 auto', md: '0 0 auto' } }}
              >
                System Management
              </Button>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ borderColor: COLOR.border, my: 0.5, display: { xs: 'none', md: 'block' } }} />

            <Button
              startIcon={<Logout fontSize="small" />}
              onClick={handleLogout}
              variant="outlined"
              sx={{ ...btnOutlinedDanger, flex: { xs: '1 1 auto', md: '0 0 auto' } }}
            >
              Logout
            </Button>
          </Box>
        </Box>

        {/* Subsystem nodes */}
        <Typography sx={{ ...TYPE.eyebrow, color: COLOR.textMuted, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Hub sx={{ fontSize: 14, color: COLOR.navy }} /> Cluster Subsystem Nodes
        </Typography>

        <Grid container spacing={{ xs: 2, md: 2.5 }} alignItems="stretch" sx={{ mb: 4 }}>
          {mappedSystems.map((sys) => (
            <Grid item key={sys.id} xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
              <Card
                onClick={() => setSelectedSystem(sys)}
                sx={{
                  borderRadius: 2, bgcolor: COLOR.panel, border: `1px solid ${COLOR.border}`,
                  borderLeft: `3px solid ${sys.isOnline ? COLOR.success : COLOR.neutral}`,
                  transition: 'box-shadow 0.15s ease, transform 0.15s ease',
                  width: '100%', display: 'flex', flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: SHADOW.card },
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
                    <Typography sx={{ ...TYPE.cardTitle, color: COLOR.textPrimary, textAlign: 'left' }}>
                      {sys.label}
                    </Typography>
                  }
                  subheader={
                    <Typography sx={{ ...TYPE.label, color: COLOR.textMuted, textAlign: 'left' }}>
                      Owner: {sys.leader}
                    </Typography>
                  }
                  sx={{ pb: 1 }}
                />
                <Divider sx={{ borderColor: COLOR.border }} />
                <CardContent sx={{ pt: 1.75, pb: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography sx={{ ...TYPE.label, color: COLOR.textSecondary }}>
                      Link state
                    </Typography>
                    <Chip
                      icon={sys.isOnline ? <CloudDone /> : <CloudOff />}
                      label={sys.isOnline ? "Connected" : "Offline"}
                      size="small"
                      sx={statusChipSx(sys.isOnline)}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Typography sx={{ ...TYPE.label, color: COLOR.textSecondary }}>
                      Records synced
                    </Typography>
                    <Typography sx={{ ...TYPE.metric, color: sys.totalRecordsCount > 0 ? COLOR.navy : COLOR.textMuted }}>
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
            <Typography sx={{ ...TYPE.sectionTitle, color: COLOR.textPrimary }}>
              Compile city-wide integration summary
            </Typography>
            <Typography sx={{ ...TYPE.label, color: COLOR.textSecondary, mt: 0.5 }}>
              Bundles connection status, node metrics, and transaction checks into a printable PDF report.
            </Typography>
          </Box>
          <Button
            startIcon={<Assessment />}
            onClick={handleGenerateReport}
            disabled={generating}
            variant="contained"
            disableElevation
            sx={{ ...btnPrimary, whiteSpace: 'nowrap' }}
          >
            {generating ? 'Compiling summary…' : 'Download PDF summary'}
          </Button>
        </Paper>

        {/* Integration Logs Toolbar */}
        <Typography sx={{ ...TYPE.eyebrow, color: COLOR.textMuted, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ListAlt sx={{ fontSize: 14, color: COLOR.navy }} /> Central Log Gateway
        </Typography>

        <Paper sx={{
          p: 2.5, mb: 3, borderRadius: 2, bgcolor: COLOR.panel, border: `1px solid ${COLOR.border}`,
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', md: 'auto' } }}>
            <FormControl size="small" sx={{ flex: { xs: '1 1 140px', sm: '0 1 auto' }, minWidth: 140 }}>
              <InputLabel sx={selectLabelSx}>Origin Subsystem</InputLabel>
              <Select
                value={systemFilter}
                onChange={(e) => setSystemFilter(e.target.value)}
                label="Origin Subsystem"
                sx={selectSx}
                MenuProps={menuPaperProps}
              >
                <MenuItem value="ALL" sx={menuItemSx}>All Subsystems</MenuItem>
                {CHOSEN_SUBSYSTEMS.map(sys => (
                  <MenuItem key={sys.id} value={sys.id} sx={menuItemSx}>{sys.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ flex: { xs: '1 1 130px', sm: '0 1 auto' }, minWidth: 130 }}>
              <InputLabel sx={selectLabelSx}>Gateway Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Gateway Status"
                sx={selectSx}
                MenuProps={menuPaperProps}
              >
                <MenuItem value="ALL" sx={menuItemSx}>All States</MenuItem>
                <MenuItem value="SUCCESS" sx={menuItemSx}>Success</MenuItem>
                <MenuItem value="FAILURE" sx={menuItemSx}>Failure</MenuItem>
              </Select>
            </FormControl>

            {filtersActive && (
              <Button
                startIcon={<FilterAltOff fontSize="small" />}
                onClick={resetFilters}
                size="small"
                sx={{
                  height: 38, textTransform: 'none', fontWeight: 600, fontFamily: FONT_BODY,
                  color: COLOR.navy, '&:hover': { bgcolor: COLOR.panelTint }
                }}
              >
                Reset filters
              </Button>
            )}
          </Box>

          <Button
            startIcon={<DeleteSweep fontSize="small" />}
            onClick={handleClearLogs}
            variant="outlined"
            size="small"
            sx={{ ...btnOutlinedDanger, height: 38, width: { xs: '100%', md: 'auto' } }}
          >
            Clear Log History
          </Button>
        </Paper>

        {/* Logs Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto', overflowY: 'hidden', bgcolor: COLOR.panel, border: `1px solid ${COLOR.border}` }}>
          <Table sx={{ minWidth: 640 }}>
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
                  <TableCell colSpan={4} align="center" sx={{ py: 7, borderColor: COLOR.border }}>
                    <ListAlt sx={{ fontSize: 28, color: COLOR.border, mb: 1 }} />
                    <Typography sx={{ ...TYPE.body, color: COLOR.textMuted }}>
                      {filtersActive
                        ? 'No log entries match the selected filters.'
                        : 'No stream activity yet. Waiting for member node handshakes…'}
                    </Typography>
                    {filtersActive && (
                      <Button
                        onClick={resetFilters}
                        size="small"
                        sx={{ mt: 1, textTransform: 'none', fontWeight: 600, fontFamily: FONT_BODY, color: COLOR.navy }}
                      >
                        Reset filters
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                data.recentActivity.map((log, index) => {
                  const timestampValue = log.timestamp || log.createdAt;
                  let formattedTime = 'N/A';
                  if (timestampValue) {
                    const date = new Date(timestampValue);
                    formattedTime = isNaN(date.getTime()) ? 'N/A' : date.toLocaleTimeString();
                  }
                  const isSuccess = log.status === 'SUCCESS';

                  return (
                    <TableRow key={log._id || index} hover sx={{ '&:hover': { bgcolor: COLOR.panelTint } }}>
                      <TableCell sx={{ ...TYPE.mono, color: COLOR.textSecondary, borderColor: COLOR.border, py: 1.5 }}>
                        {formattedTime}
                      </TableCell>
                      <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: '0.85rem', color: COLOR.textPrimary, textAlign: 'left', borderColor: COLOR.border, py: 1.5 }}>
                        {CHOSEN_SUBSYSTEMS.find(sys => sys.id === log.systemName)?.label || log.systemName?.replace(/([A-Z])/g, ' $1').trim()}
                      </TableCell>
                      <TableCell sx={{ borderColor: COLOR.border, py: 1.5 }}>
                        <Chip
                          label={log.status}
                          size="small"
                          sx={{
                            fontWeight: 600, fontFamily: FONT_BODY, borderRadius: '6px', fontSize: '0.7rem',
                            color: isSuccess ? COLOR.success : COLOR.danger,
                            bgcolor: isSuccess ? COLOR.successBg : COLOR.dangerBg,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ borderColor: COLOR.border, py: 1.5 }}>
                        <Box
                          onClick={() => setViewingPayload(log)}
                          component="code"
                          sx={{
                            fontFamily: FONT_MONO, fontSize: '0.75rem', bgcolor: COLOR.panelTint, p: '4px 10px',
                            borderRadius: 1.5, color: COLOR.textSecondary, display: 'inline-block',
                            maxWidth: { xs: '220px', sm: '450px' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            border: `1px solid ${COLOR.border}`, cursor: 'pointer',
                            '&:hover': { borderColor: COLOR.navy, bgcolor: COLOR.panel, color: COLOR.navy }
                          }}
                        >
                          {JSON.stringify(log.payloadReceived || {})}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Subsystem detail dialog — single close affordance (top-right X) instead of a duplicate footer button */}
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
                <Typography sx={TYPE.dialogTitle}>
                  {selectedSystem.label}
                </Typography>
                <Typography sx={{ ...TYPE.label, color: COLOR.textMuted }}>
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

            <DialogContent sx={{ pt: 2.5, pb: 3 }}>
              <Typography sx={{ ...TYPE.eyebrow, color: COLOR.textMuted, mb: 0.75 }}>
                What it does
              </Typography>
              <Typography sx={{ ...TYPE.body, color: COLOR.textSecondary, lineHeight: 1.6, mb: 3 }}>
                {selectedSystem.description}
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Box sx={{ flex: 1, p: 1.5, borderRadius: 1.5, bgcolor: COLOR.panelTint, border: `1px solid ${COLOR.border}` }}>
                  <Typography sx={{ ...TYPE.label, color: COLOR.textSecondary, mb: 0.5 }}>
                    Link state
                  </Typography>
                  <Chip
                    icon={selectedSystem.isOnline ? <CloudDone /> : <CloudOff />}
                    label={selectedSystem.isOnline ? "Connected" : "Offline"}
                    size="small"
                    sx={statusChipSx(selectedSystem.isOnline)}
                  />
                </Box>
                <Box sx={{ flex: 1, p: 1.5, borderRadius: 1.5, bgcolor: COLOR.panelTint, border: `1px solid ${COLOR.border}` }}>
                  <Typography sx={{ ...TYPE.label, color: COLOR.textSecondary, mb: 0.5 }}>
                    Records synced
                  </Typography>
                  <Typography sx={{ ...TYPE.metric, fontSize: '1.1rem', color: selectedSystem.totalRecordsCount > 0 ? COLOR.navy : COLOR.textMuted }}>
                    {selectedSystem.totalRecordsCount}
                  </Typography>
                </Box>
              </Stack>

              {selectedSystem.lastHeartbeat && (
                <Typography sx={{ ...TYPE.mono, color: COLOR.textMuted, mt: 2 }}>
                  Last heartbeat: {new Date(selectedSystem.lastHeartbeat).toLocaleString()}
                </Typography>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Dynamic JSON Payload Inspector Dialog — same single close affordance */}
      <Dialog
        open={Boolean(viewingPayload)}
        onClose={() => setViewingPayload(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2.5, border: `1px solid ${COLOR.border}` } }}
      >
        {viewingPayload && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={TYPE.dialogTitle}>
                  Payload Diagnostic View
                </Typography>
                <Typography sx={{ ...TYPE.label, color: COLOR.textMuted }}>
                  Integration Log ID: {viewingPayload._id}
                </Typography>
              </Box>
              <IconButton onClick={() => setViewingPayload(null)} sx={{ color: COLOR.textMuted }}>
                <Close fontSize="small" />
              </IconButton>
            </DialogTitle>

            <Divider sx={{ borderColor: COLOR.border }} />

            <DialogContent sx={{ bgcolor: COLOR.bg, p: 2, pb: 3 }}>
              {viewingPayload.status === 'FAILURE' && viewingPayload.errorMessage && (
                <Box sx={{ p: 1.5, mb: 2, borderRadius: 1.5, bgcolor: COLOR.dangerBg, border: `1px solid ${COLOR.danger}` }}>
                  <Typography sx={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: '0.75rem', color: COLOR.danger, mb: 0.5 }}>
                    Runtime Crash Context:
                  </Typography>
                  <Typography sx={{ ...TYPE.mono, color: COLOR.danger }}>
                    {viewingPayload.errorMessage}
                  </Typography>
                </Box>
              )}

              <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: '#1E1E1E', border: '1px solid #333', overflowX: 'auto' }}>
                <Typography component="pre" sx={{
                  fontFamily: FONT_MONO,
                  fontSize: '0.75rem',
                  color: '#A9B7C6',
                  margin: 0,
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {JSON.stringify(viewingPayload.payloadReceived || {}, null, 2)}
                </Typography>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}