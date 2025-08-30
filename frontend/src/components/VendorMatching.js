import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import axios from 'axios';

const VendorMatching = ({ eventId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({
    category: '',
    date: null,
    budget: '',
    location: ''
  });

  const categories = [
    'Catering',
    'Photography',
    'Decoration',
    'Music',
    'Makeup',
    'Venue',
    'Other'
  ];

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/vendor/match', {
        params: {
          ...searchParams,
          date: searchParams.date?.toISOString()
        }
      });
      setVendors(response.data);
    } catch (err) {
      setError('Failed to find matching vendors');
    }
    setLoading(false);
  };

  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    setDialogOpen(true);
  };

  const handleRequestVendor = async () => {
    try {
      await axios.post('/api/vendor/request', {
        eventId,
        vendorId: selectedVendor.vendor._id,
        category: searchParams.category
      });
      setDialogOpen(false);
      // Show success message or update UI
    } catch (err) {
      setError('Failed to send request to vendor');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Search Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Find Vendors
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={searchParams.category}
                label="Category"
                onChange={(e) => setSearchParams(prev => ({
                  ...prev,
                  category: e.target.value
                }))}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Event Date"
                value={searchParams.date}
                onChange={(newValue) => setSearchParams(prev => ({
                  ...prev,
                  date: newValue
                }))}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Budget"
              type="number"
              value={searchParams.budget}
              onChange={(e) => setSearchParams(prev => ({
                ...prev,
                budget: e.target.value
              }))}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Location"
              value={searchParams.location}
              onChange={(e) => setSearchParams(prev => ({
                ...prev,
                location: e.target.value
              }))}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Search Vendors'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results */}
      <Grid container spacing={3}>
        {vendors.map((vendor) => (
          <Grid item xs={12} sm={6} md={4} key={vendor._id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={vendor.vendor.profilePicture || '/default-vendor.jpg'}
                alt={vendor.businessName}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {vendor.businessName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating
                    value={vendor.performance.averageRating}
                    precision={0.5}
                    readOnly
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({vendor.performance.totalEvents} events)
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {vendor.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {vendor.categories.map((category, index) => (
                    <Chip key={index} label={category} size="small" />
                  ))}
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleVendorSelect(vendor)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Vendor Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedVendor && (
          <>
            <DialogTitle>{selectedVendor.businessName}</DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Services
                  </Typography>
                  {selectedVendor.services.map((service, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1">{service.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {service.description}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ${service.price}
                      </Typography>
                    </Paper>
                  ))}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Performance Metrics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {selectedVendor.performance.completionRate}%
                        </Typography>
                        <Typography variant="body2">Completion Rate</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {selectedVendor.performance.responseTime}m
                        </Typography>
                        <Typography variant="body2">Avg. Response Time</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRequestVendor}
              >
                Request Vendor
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default VendorMatching; 