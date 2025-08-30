import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert as MuiAlert,
} from '@mui/material';
import axios from 'axios';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, eventsRes] = await Promise.all([
          axios.get('/admin/users'),
          axios.get('/admin/events'),
        ]);
        setUsers(usersRes.data.filter(u => u.role !== 'vendor'));
        setVendors(usersRes.data.filter(u => u.role === 'vendor'));
        setEvents(eventsRes.data);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleUpdateUser = async () => {
    try {
      await axios.put(`/admin/users/${selectedUser._id}`, {
        role: selectedUser.role,
      });
      const res = await axios.get('/admin/users');
      setUsers(res.data);
      handleCloseDialog();
      setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error updating user', severity: 'error' });
      console.error('Error updating user:', err);
    }
  };

  const handleDelete = (type, id) => {
    setDeleteDialog({ open: true, type, id });
  };

  const refreshData = async () => {
    try {
      const [usersRes, eventsRes] = await Promise.all([
        axios.get('/admin/users'),
        axios.get('/admin/events'),
      ]);
      setUsers(usersRes.data.filter(u => u.role !== 'vendor'));
      setVendors(usersRes.data.filter(u => u.role === 'vendor'));
      setEvents(eventsRes.data);
    } catch (err) {
      console.error('Error refreshing admin data:', err);
    }
  };

  const confirmDelete = async () => {
    try {
      if (deleteDialog.type === 'user' || deleteDialog.type === 'vendor') {
        await axios.delete(`/users/${deleteDialog.id}`);
        setSnackbar({ 
          open: true, 
          message: `${deleteDialog.type === 'user' ? 'User' : 'Vendor'} deleted successfully`, 
          severity: 'success' 
        });
      } else if (deleteDialog.type === 'event') {
        await axios.delete(`/admin/events/${deleteDialog.id}`);
        setSnackbar({ 
          open: true, 
          message: 'Event deleted successfully', 
          severity: 'success' 
        });
      }
      await refreshData();
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || `Error deleting ${deleteDialog.type}`, 
        severity: 'error' 
      });
      console.error('Error deleting:', err);
    } finally {
      setDeleteDialog({ open: false, type: '', id: null });
    }
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialog({ open: false, type: '', id: null });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'vendor':
        return 'warning';
      case 'user':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Users" />
          <Tab label="Events" />
          <Tab label="Vendors" />
        </Tabs>

        {tabValue === 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleUserClick(user)}>
                        Edit
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete('user', user._id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tabValue === 1 && (
          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid item key={event._id} xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {format(new Date(event.date), 'MMMM d, yyyy')}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {event.description && typeof event.description === 'string' ? event.description.substring(0, 100) : ''}...
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={event.eventType}
                        color="primary"
                        size="small"
                      />
                      <Typography variant="body2">
                        Organizer: {event.organizer && event.organizer.name ? event.organizer.name : 'Unknown'}
                      </Typography>
                      <Button size="small" color="error" onClick={() => handleDelete('event', event._id)}>
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {tabValue === 2 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendors.map((vendor) => (
                  <TableRow key={vendor._id}>
                    <TableCell>{vendor.name}</TableCell>
                    <TableCell>{vendor.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={vendor.role}
                        color={getRoleColor(vendor.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(vendor.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button size="small" color="error" onClick={() => handleDelete('vendor', vendor._id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Edit User Role</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <>
              <TextField
                margin="dense"
                label="Name"
                fullWidth
                value={selectedUser.name}
                disabled
              />
              <TextField
                margin="dense"
                label="Email"
                fullWidth
                value={selectedUser.email}
                disabled
              />
              <TextField
                margin="dense"
                label="Role"
                fullWidth
                select
                value={selectedUser.role}
                onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
              >
                <option value="user">User</option>
                <option value="vendor">Vendor</option>
                <option value="admin">Admin</option>
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteDialogClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            Are you sure you want to delete this {deleteDialog.type}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default AdminDashboard; 