import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  Chip,
  Card,
  CardMedia,
  CardContent,
  Rating,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const VendorProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    categories: [],
    services: [],
    location: {
      address: '',
      city: '',
      state: '',
      country: ''
    },
    contact: {
      email: '',
      phone: '',
      website: ''
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/vendor/profile');
      setProfile(response.data);
      setFormData({
        businessName: response.data.businessName,
        description: response.data.description,
        categories: response.data.categories,
        services: response.data.services,
        location: response.data.location,
        contact: response.data.contact
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/vendor/profile', formData);
      setProfile(response.data);
      setEditMode(false);
      setError(null);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                {profile?.businessName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {profile?.description}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color={editMode ? "secondary" : "primary"}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "Cancel" : "Edit Profile"}
            </Button>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
              <Tab label="Profile" />
              <Tab label="Portfolio" />
              <Tab label="Availability" />
              <Tab label="Performance" />
            </Tabs>

            {activeTab === 0 && (
              <Box>
                {editMode ? (
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Business Name"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleInputChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="Description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                          Categories
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {formData.categories.map((category, index) => (
                            <Chip
                              key={index}
                              label={category}
                              onDelete={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  categories: prev.categories.filter((_, i) => i !== index)
                                }));
                              }}
                            />
                          ))}
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Button type="submit" variant="contained" color="primary">
                          Save Changes
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                ) : (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        Categories
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {profile?.categories.map((category, index) => (
                          <Chip key={index} label={category} />
                        ))}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        Services
                      </Typography>
                      <Grid container spacing={2}>
                        {profile?.services.map((service, index) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Card>
                              <CardContent>
                                <Typography variant="h6">{service.name}</Typography>
                                <Typography color="text.secondary">
                                  {service.description}
                                </Typography>
                                <Typography variant="h6" color="primary">
                                  ${service.price}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Portfolio
                </Typography>
                <Grid container spacing={3}>
                  {profile?.portfolio.images.map((image, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card>
                        <CardMedia
                          component="img"
                          height="200"
                          image={image.url}
                          alt={image.caption}
                        />
                        <CardContent>
                          <Typography variant="subtitle1">{image.caption}</Typography>
                          <Chip label={image.category} size="small" />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Availability
                </Typography>
                {/* Add calendar component here */}
              </Box>
            )}

            {activeTab === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Performance Metrics
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {profile?.performance.totalEvents}
                      </Typography>
                      <Typography variant="subtitle1">Total Events</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {profile?.performance.averageRating.toFixed(1)}
                      </Typography>
                      <Typography variant="subtitle1">Average Rating</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {profile?.performance.completionRate}%
                      </Typography>
                      <Typography variant="subtitle1">Completion Rate</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        ${profile?.performance.revenue}
                      </Typography>
                      <Typography variant="subtitle1">Total Revenue</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Typography variant="body1">
              Email: {profile?.contact.email}
            </Typography>
            <Typography variant="body1">
              Phone: {profile?.contact.phone}
            </Typography>
            <Typography variant="body1">
              Website: {profile?.contact.website}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Location
            </Typography>
            <Typography variant="body1">
              {profile?.location.address}
            </Typography>
            <Typography variant="body1">
              {profile?.location.city}, {profile?.location.state}
            </Typography>
            <Typography variant="body1">
              {profile?.location.country}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default VendorProfile; 