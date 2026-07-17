import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../utils/api';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// ---- Design tokens (Synchronized with AdminDashboard) ----------------------
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
  warning: '#D97706',
  warningBg: '#FEF3C7',
  neutral: '#8A93A3',
  neutralBg: '#F0F1F3',
  textPrimary: '#1A2332',
  textSecondary: '#5B6472',
  textMuted: '#8A93A3',
};

const FONT_DISPLAY = "'IBM Plex Sans', 'Segoe UI', sans-serif";
const FONT_BODY = "'IBM Plex Sans', 'Segoe UI', sans-serif";
const FONT_MONO = "'IBM Plex Mono', 'Roboto Mono', monospace";

const STATUS_MAPPING = {
  Active: { color: COLOR.success, bg: COLOR.successBg },
  Suspended: { color: COLOR.danger, bg: COLOR.dangerBg },
  Maintenance: { color: COLOR.warning, bg: COLOR.warningBg }
};

export default function SystemManagement() {
  const navigate = useNavigate();
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealKey, setRevealKey] = useState({}); // Tracks which API keys are unmasked
  
  // Dialog States
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState(null);

  // Form States
  const [formData, setFormData] = useState({ systemName: '', contactEmail: '', status: 'Active' });

  // Toast notification state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch systems on mount
  useEffect(() => {
    fetchSystems();
  }, []);

  const showToast = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchSystems = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/systems'));
      const data = await res.json();
      if (data.success) {
        setSystems(data.systems);
      } else {
        showToast(data.error || 'Failed to load systems', 'error');
      }
    } catch (err) {
      showToast('Network error loading systems', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl('/api/systems'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${formData.systemName} registered successfully!`);
        setOpenAdd(false);
        setFormData({ systemName: '', contactEmail: '', status: 'Active' });
        fetchSystems();
      } else {
        showToast(data.error || 'Failed to register system', 'error');
      }
    } catch (err) {
      showToast('Network error saving system', 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl(`/api/systems/${selectedSystem._id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('System updated successfully!');
        setOpenEdit(false);
        setSelectedSystem(null);
        fetchSystems();
      } else {
        showToast(data.error || 'Failed to update system', 'error');
      }
    } catch (err) {
      showToast('Network error updating system', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}? This will revoke its API access.`)) return;
    try {
      const res = await fetch(apiUrl(`/api/systems/${id}`), { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('System unregistered successfully', 'info');
        fetchSystems();
      } else {
        showToast(data.error || 'Failed to delete system', 'error');
      }
    } catch (err) {
      showToast('Network error deleting system', 'error');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('API Key copied to clipboard!', 'success');
  };

  const toggleKeyVisibility = (id) => {
    setRevealKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openEditModal = (system) => {
    setSelectedSystem(system);
    setFormData({
      systemName: system.systemName,
      contactEmail: system.contactEmail,
      status: system.status
    });
    setOpenEdit(true);
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: COLOR.bg, boxSizing: 'border-box', margin: 0, fontFamily: FONT_BODY }}>
      <Box sx={{ height: 4, width: '100%', bgcolor: COLOR.navy }} />

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Header Panel */}
        <Box sx={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center',
          gap: 2, mb: 4, pb: 3, borderBottom: `1px solid ${COLOR.border}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={() => navigate('/')} 
              sx={{ 
                bgcolor: COLOR.panel, border: `1px solid ${COLOR.border}`, borderRadius: 1.5,
                color: COLOR.textSecondary, '&:hover': { bgcolor: COLOR.panelTint }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ textAlign: 'left' }}>
              <Typography sx={{
                fontFamily: FONT_MONO, color: COLOR.textMuted, fontSize: '0.68rem',
                letterSpacing: '1.5px', textTransform: 'uppercase', mb: 0.25
              }}>
                Security {"&"} Gateway Configuration
              </Typography>
              <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: { xs: '1.3rem', md: '1.55rem' }, color: COLOR.textPrimary, letterSpacing: '-0.2px' }}>
                System Management
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            disableElevation
            startIcon={<AddIcon />}
            onClick={() => {
              setFormData({ systemName: '', contactEmail: '', status: 'Active' });
              setOpenAdd(true);
            }}
            sx={{
              fontWeight: 600, textTransform: 'none', borderRadius: 1.5, px: 2.5, height: 40,
              fontFamily: FONT_BODY, bgcolor: COLOR.navy,
              '&:hover': { bgcolor: COLOR.navyDark }
            }}
          >
            Register System
          </Button>
        </Box>

        {/* Main Table Container */}
        <Card sx={{ boxShadow: 'none', borderRadius: 2, border: `1px solid ${COLOR.border}`, bgcolor: COLOR.panel }}>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 250 }}>
                <CircularProgress size={40} thickness={4} sx={{ color: COLOR.navy }} />
              </Box>
            ) : systems.length === 0 ? (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.9rem', color: COLOR.textSecondary }}>
                  No systems registered yet. Click "Register System" above to begin.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead sx={{ bgcolor: COLOR.panelTint }}>
                    <TableRow>
                      {['Subsystem Name', 'Contact Email', 'Integration API Key', 'Status', 'Registered At', 'Actions'].map((header, idx) => (
                        <TableCell 
                          key={header} 
                          align={idx === 5 ? 'right' : 'left'}
                          sx={{ 
                            fontFamily: FONT_BODY, fontWeight: 700, fontSize: '0.72rem', 
                            letterSpacing: '0.5px', textTransform: 'uppercase', color: COLOR.textSecondary,
                            borderColor: COLOR.border, py: 2 
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {systems.map((system) => {
                      const statusConfig = STATUS_MAPPING[system.status] || { color: COLOR.neutral, bg: COLOR.neutralBg };
                      return (
                        <TableRow key={system._id} hover sx={{ '&:hover': { bgcolor: COLOR.panelTint } }}>
                          <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: '0.88rem', color: COLOR.textPrimary, borderColor: COLOR.border }}>
                            {system.systemName}
                          </TableCell>
                          <TableCell sx={{ fontFamily: FONT_BODY, fontSize: '0.85rem', color: COLOR.textSecondary, borderColor: COLOR.border }}>
                            {system.contactEmail}
                          </TableCell>
                          <TableCell sx={{ borderColor: COLOR.border }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box 
                                component="code" 
                                sx={{
                                  fontFamily: FONT_MONO, fontSize: '0.78rem', bgcolor: COLOR.panelTint, 
                                  p: '4px 10px', borderRadius: 1.5, color: COLOR.textSecondary,
                                  border: `1px solid ${COLOR.border}`, minWidth: '180px', display: 'inline-block'
                                }}
                              >
                                {revealKey[system._id] ? system.apiKey : '••••••••••••••••••••••••••••••••'}
                              </Box>
                              <IconButton size="small" onClick={() => toggleKeyVisibility(system._id)} sx={{ color: COLOR.textSecondary }}>
                                {revealKey[system._id] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                              </IconButton>
                              <Tooltip title="Copy API Key">
                                <IconButton size="small" onClick={() => copyToClipboard(system.apiKey)} sx={{ color: COLOR.textSecondary }}>
                                  <CopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ borderColor: COLOR.border }}>
                            <Chip
                              label={system.status}
                              size="small"
                              sx={{ 
                                fontWeight: 600, fontFamily: FONT_BODY, borderRadius: '6px', fontSize: '0.7rem',
                                color: statusConfig.color, bgcolor: statusConfig.bg 
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontFamily: FONT_MONO, fontSize: '0.8rem', color: COLOR.textSecondary, borderColor: COLOR.border }}>
                            {new Date(system.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="right" sx={{ borderColor: COLOR.border }}>
                            <Tooltip title="Edit System">
                              <IconButton onClick={() => openEditModal(system)} sx={{ color: COLOR.navy }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Unregister System">
                              <IconButton onClick={() => handleDelete(system._id, system.systemName)} sx={{ color: COLOR.danger }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Add System Dialog */}
      <Dialog 
        open={openAdd} 
        onClose={() => setOpenAdd(false)} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 2.5, border: `1px solid ${COLOR.border}` } }}
      >
        <form onSubmit={handleAddSubmit}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 6 }}>
            <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: '1.05rem', color: COLOR.textPrimary }}>
              Register New Subsystem
            </Typography>
            <IconButton
              onClick={() => setOpenAdd(false)}
              sx={{ position: 'absolute', right: 12, top: 12, color: COLOR.textMuted }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <Divider sx={{ borderColor: COLOR.border }} />
          
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
            <TextField
              label="System Name"
              required
              fullWidth
              value={formData.systemName}
              placeholder="e.g. FacilityReservation"
              onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
              InputProps={{ sx: { borderRadius: 1.5, fontFamily: FONT_BODY } }}
              InputLabelProps={{ sx: { fontFamily: FONT_BODY } }}
            />
            <TextField
              label="Contact Email"
              type="email"
              required
              fullWidth
              value={formData.contactEmail}
              placeholder="admin@system.com"
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              InputProps={{ sx: { borderRadius: 1.5, fontFamily: FONT_BODY } }}
              InputLabelProps={{ sx: { fontFamily: FONT_BODY } }}
            />
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: FONT_BODY }}>Initial Status</InputLabel>
              <Select
                value={formData.status}
                label="Initial Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                sx={{ borderRadius: 1.5, fontFamily: FONT_BODY }}
              >
                <MenuItem value="Active" sx={{ fontFamily: FONT_BODY }}>Active</MenuItem>
                <MenuItem value="Maintenance" sx={{ fontFamily: FONT_BODY }}>Maintenance</MenuItem>
                <MenuItem value="Suspended" sx={{ fontFamily: FONT_BODY }}>Suspended</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button 
              onClick={() => setOpenAdd(false)}
              variant="outlined"
              sx={{
                textTransform: 'none', fontWeight: 600, borderRadius: 1.5,
                fontFamily: FONT_BODY, color: COLOR.textSecondary, borderColor: COLOR.border
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              disableElevation
              sx={{
                textTransform: 'none', fontWeight: 600, borderRadius: 1.5,
                fontFamily: FONT_BODY, bgcolor: COLOR.navy, '&:hover': { bgcolor: COLOR.navyDark }
              }}
            >
              Register
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit System Dialog */}
      <Dialog 
        open={openEdit} 
        onClose={() => setOpenEdit(false)} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 2.5, border: `1px solid ${COLOR.border}` } }}
      >
        <form onSubmit={handleEditSubmit}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 6 }}>
            <Typography sx={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: '1.05rem', color: COLOR.textPrimary }}>
              Edit Subsystem Settings
            </Typography>
            <IconButton
              onClick={() => setOpenEdit(false)}
              sx={{ position: 'absolute', right: 12, top: 12, color: COLOR.textMuted }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <Divider sx={{ borderColor: COLOR.border }} />

          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
            <TextField
              label="System Name"
              required
              disabled
              fullWidth
              value={formData.systemName}
              InputProps={{ sx: { borderRadius: 1.5, fontFamily: FONT_BODY } }}
              InputLabelProps={{ sx: { fontFamily: FONT_BODY } }}
            />
            <TextField
              label="Contact Email"
              type="email"
              required
              fullWidth
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              InputProps={{ sx: { borderRadius: 1.5, fontFamily: FONT_BODY } }}
              InputLabelProps={{ sx: { fontFamily: FONT_BODY } }}
            />
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: FONT_BODY }}>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                sx={{ borderRadius: 1.5, fontFamily: FONT_BODY }}
              >
                <MenuItem value="Active" sx={{ fontFamily: FONT_BODY }}>Active</MenuItem>
                <MenuItem value="Maintenance" sx={{ fontFamily: FONT_BODY }}>Maintenance</MenuItem>
                <MenuItem value="Suspended" sx={{ fontFamily: FONT_BODY }}>Suspended</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button 
              onClick={() => setOpenEdit(false)}
              variant="outlined"
              sx={{
                textTransform: 'none', fontWeight: 600, borderRadius: 1.5,
                fontFamily: FONT_BODY, color: COLOR.textSecondary, borderColor: COLOR.border
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              disableElevation
              sx={{
                textTransform: 'none', fontWeight: 600, borderRadius: 1.5,
                fontFamily: FONT_BODY, bgcolor: COLOR.navy, '&:hover': { bgcolor: COLOR.navyDark }
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Action Toast Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%', 
            fontFamily: FONT_BODY, 
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: snackbar.severity === 'success' ? '#2F8F5B33' : '#C0392B33'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}