import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert as MuiAlert,
  Paper,
  Rating,
  CircularProgress,
  CardMedia,
  MenuItem,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const VendorRequests = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [openRequirements, setOpenRequirements] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyDialog, setApplyDialog] = useState({ open: false, req: null });
  const [proposal, setProposal] = useState('');
  const [price, setPrice] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editDialog, setEditDialog] = useState({ open: false, request: null });
  const [withdrawDialog, setWithdrawDialog] = useState({ open: false, request: null });
  const [profile, setProfile] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [portfolioDialog, setPortfolioDialog] = useState({ open: false, type: 'image' });
  const [portfolioItem, setPortfolioItem] = useState({ url: '', caption: '', category: '' });
  const [stats, setStats] = useState({
    totalProposals: 0,
    approvedProposals: 0,
    pendingProposals: 0,
    rejectedProposals: 0,
    totalEarnings: 0
  });

  // Helper to fetch requests and open requirements
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [openRes, myReqRes, profileRes] = await Promise.all([
        axios.get('/vendors/open-requirements'),
        axios.get('/vendors/requests'),
        axios.get('/vendor/profile')
      ]);
      
      setOpenRequirements(Array.isArray(openRes.data) ? openRes.data : []);
      setRequests(Array.isArray(myReqRes.data) ? myReqRes.data : []);
      
      if (profileRes.data) {
        setProfile(profileRes.data);
        setPortfolio(profileRes.data.portfolio || { images: [], videos: [], testimonials: [] });
        setAvailability(profileRes.data.availability?.schedule || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setOpenRequirements([]);
      setRequests([]);
      setSnackbar({
        open: true,
        message: 'Error loading data. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Refresh data when tab is focused (for real-time update after approval)
  useEffect(() => {
    const handleFocus = () => {
      fetchAllData();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchAllData]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/vendors/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching vendor stats:', err);
      }
    };

    fetchStats();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleApply = (req) => {
    setApplyDialog({ open: true, req });
    setProposal('');
    setPrice('');
  };

  const handleSubmitProposal = async () => {
    try {
      if (!proposal || !price) {
        setSnackbar({ 
          open: true, 
          message: 'Please fill in all fields', 
          severity: 'error' 
        });
        return;
      }

      // Format the category to match the backend enum
      const formattedCategory = applyDialog.req.category.toLowerCase();

      await axios.post('/vendors/requests', {
        eventId: applyDialog.req.eventId,
        requirementId: applyDialog.req.requirementId,
        category: formattedCategory,
        proposal,
        price: parseFloat(price),
      });

      setSnackbar({ 
        open: true, 
        message: 'Proposal submitted successfully!', 
        severity: 'success' 
      });
      setApplyDialog({ open: false, req: null });
      
      // Refresh data
      await fetchAllData();
    } catch (err) {
      console.error('Error submitting proposal:', err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Error submitting proposal', 
        severity: 'error' 
      });
    }
  };

  const handleEdit = (request) => {
    setEditDialog({ open: true, request });
    setProposal(request.proposal);
    setPrice(request.price);
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`/vendors/requests/${editDialog.request._id}`, {
        proposal,
        price,
      });
      setSnackbar({ open: true, message: 'Proposal updated!', severity: 'success' });
      setEditDialog({ open: false, request: null });
      // Refresh data
      await fetchAllData();
    } catch (err) {
      console.error('Error updating proposal:', err);
      setSnackbar({ open: true, message: err.response?.data?.message || 'Error updating proposal', severity: 'error' });
    }
  };

  const handleWithdraw = (request) => {
    setWithdrawDialog({ open: true, request });
  };

  const handleWithdrawConfirm = async () => {
    try {
      await axios.delete(`/vendors/requests/${withdrawDialog.request._id}`);
      setSnackbar({ open: true, message: 'Proposal withdrawn!', severity: 'success' });
      setWithdrawDialog({ open: false, request: null });
      // Refresh data
      await fetchAllData();
    } catch (err) {
      console.error('Error withdrawing proposal:', err);
      setSnackbar({ open: true, message: err.response?.data?.message || 'Error withdrawing proposal', severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleAddPortfolioItem = async () => {
    try {
      if (!portfolioItem.url || !portfolioItem.caption || !portfolioItem.category) {
        setSnackbar({
          open: true,
          message: 'Please fill in all fields',
          severity: 'error'
        });
        return;
      }

      await axios.post('/vendor/portfolio', {
        type: portfolioDialog.type,
        ...portfolioItem
      });

      setSnackbar({
        open: true,
        message: 'Portfolio item added successfully!',
        severity: 'success'
      });
      setPortfolioDialog({ open: false, type: 'image' });
      setPortfolioItem({ url: '', caption: '', category: '' });
      
      // Refresh data
      await fetchAllData();
    } catch (err) {
      console.error('Error adding portfolio item:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Error adding portfolio item',
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f7fa', pt: { xs: 8, sm: 10 } }}>
      <Container maxWidth="lg">
        {/* Stats Overview Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{
              background: 'linear-gradient(45deg, #4ECDC4 30%, #45B7D1 90%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 4px 20px 0 rgba(78,205,196,0.2)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Total Proposals</Typography>
                <Typography variant="h3">{stats.totalProposals}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{
              background: 'linear-gradient(45deg, #FFD166 30%, #FF6B6B 90%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 4px 20px 0 rgba(255,209,102,0.2)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Approved</Typography>
                <Typography variant="h3">{stats.approvedProposals}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{
              background: 'linear-gradient(45deg, #A78BFA 30%, #818CF8 90%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 4px 20px 0 rgba(167,139,250,0.2)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Pending</Typography>
                <Typography variant="h3">{stats.pendingProposals}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{
              background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 4px 20px 0 rgba(255,107,107,0.2)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Total Earnings</Typography>
                <Typography variant="h3">${stats.totalEarnings}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs Section */}
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minWidth: 200,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab label="Open Opportunities" />
            <Tab label="My Proposals" />
            <Tab label="Portfolio" />
            <Tab label="Availability" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {openRequirements.map((requirement) => (
              <Grid item xs={12} md={6} key={requirement._id}>
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 24px 0 rgba(78,205,196,0.10)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 32px 0 rgba(78,205,196,0.18)'
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {requirement.event?.title || 'Untitled Event'}
                      </Typography>
                      <Chip
                        label={requirement.category}
                        sx={{
                          background: 'linear-gradient(45deg, #4ECDC4 30%, #45B7D1 90%)',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {requirement.event?.date ? format(new Date(requirement.event.date), 'MMMM d, yyyy') : 'Date not specified'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {requirement.description || 'No description available'}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Budget: ${requirement.budget || 0}
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => handleApply(requirement)}
                        sx={{
                          background: 'linear-gradient(45deg, #4ECDC4 30%, #45B7D1 90%)',
                          color: 'white',
                          fontWeight: 600,
                          '&:hover': {
                            background: 'linear-gradient(45deg, #45B7D1 30%, #4ECDC4 90%)'
                          }
                        }}
                      >
                        Submit Proposal
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleApply(requirement)}
                        sx={{
                          background: 'linear-gradient(45deg, #4ECDC4 30%, #45B7D1 90%)',
                          color: 'white',
                          fontWeight: 600,
                          '&:hover': {
                            background: 'linear-gradient(45deg, #45B7D1 30%, #4ECDC4 90%)'
                          }
                        }}
                      >
                        Accept
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {tabValue === 1 && (
          <Grid container spacing={3}>
            {requests.map((request) => (
              <Grid item xs={12} md={6} key={request._id}>
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 24px 0 rgba(78,205,196,0.10)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 32px 0 rgba(78,205,196,0.18)'
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {request.event?.title || 'Untitled Event'}
                      </Typography>
                      <Chip
                        label={request.status}
                        color={getStatusColor(request.status)}
                        sx={{
                          fontWeight: 600,
                          background: request.status === 'approved'
                            ? 'linear-gradient(45deg, #4ECDC4 30%, #45B7D1 90%)'
                            : request.status === 'pending'
                            ? 'linear-gradient(45deg, #FFD166 30%, #FF6B6B 90%)'
                            : 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                          color: 'white'
                        }}
                      />
                    </Box>
                    <Typography variant="subtitle1" sx={{ mb: 1, color: 'secondary.main', fontWeight: 500 }}>
                      Category: {request.category || 'Uncategorized'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {request.proposal || 'No proposal details available'}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Price: ${request.price || 0}
                      </Typography>
                      <Box>
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="small"
                              onClick={() => handleEdit(request)}
                              sx={{ mr: 1 }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleWithdraw(request)}
                            >
                              Withdraw
                            </Button>
                          </>
                        )}
                        {request.event?._id && (
                          <Button
                            size="small"
                            sx={{
                              ml: 1,
                              color: 'primary.main',
                              fontWeight: 600,
                              '&:hover': {
                                background: 'rgba(78,205,196,0.08)'
                              }
                            }}
                            onClick={() => window.location.href = `/events/${request.event._id}`}
                          >
                            View Event
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {tabValue === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Portfolio Showcase
              </Typography>
              <Box>
                <Button 
                  variant="contained" 
                  onClick={() => setPortfolioDialog({ open: true, type: 'image' })}
                  sx={{ mr: 1 }}
                >
                  Add Image
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => setPortfolioDialog({ open: true, type: 'video' })}
                >
                  Add Video
                </Button>
              </Box>
            </Box>

            {/* Preview Section */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
              <Typography variant="subtitle1" gutterBottom>
                Preview: How your portfolio appears to event organizers
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This is how your portfolio will be displayed when event organizers view your profile. 
                Make sure to add high-quality images and videos that showcase your best work!
              </Typography>
            </Paper>

            <Grid container spacing={3}>
              {portfolio.images?.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.url}
                      alt={item.caption}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography variant="subtitle1">{item.caption}</Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip label={item.category} size="small" sx={{ mr: 1 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {portfolio.videos?.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={`video-${index}`}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1">{item.caption}</Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip label={item.category} size="small" sx={{ mr: 1 }} />
                        <Chip label="Video" size="small" color="primary" />
                      </Box>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        sx={{ mt: 1 }}
                        href={item.url}
                        target="_blank"
                      >
                        View Video
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {(!portfolio.images?.length && !portfolio.videos?.length) && (
                <Grid item xs={12}>
                  <Typography variant="body1" color="text.secondary" align="center">
                    No portfolio items yet. Add some images or videos to showcase your work!
                  </Typography>
                </Grid>
              )}
            </Grid>

            {/* Tips Section */}
            <Paper sx={{ p: 2, mt: 3, bgcolor: '#f5f5f5' }}>
              <Typography variant="subtitle1" gutterBottom>
                Tips for a Great Portfolio
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                1. Add high-quality images that showcase your best work
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                2. Include a variety of work across different categories
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                3. Write clear, descriptive captions for each item
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                4. Keep your portfolio updated with your latest work
              </Typography>
            </Paper>
          </Box>
        )}

        {tabValue === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Availability Calendar
            </Typography>
            <Grid container spacing={3}>
              {availability.map((slot, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1">
                        {new Date(slot.date).toLocaleDateString()}
                      </Typography>
                      <Chip 
                        label={slot.status} 
                        color={slot.status === 'available' ? 'success' : 'error'}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {availability.length === 0 && (
                <Grid item xs={12}>
                  <Typography variant="body1" color="text.secondary" align="center">
                    No availability slots set. Update your profile to set your availability.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </Container>
      {/* Proposal Dialog */}
      <Dialog open={applyDialog.open} onClose={() => setApplyDialog({ open: false, req: null })}>
        <DialogTitle>Submit Proposal</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {applyDialog.req && applyDialog.req.eventTitle} - {applyDialog.req && applyDialog.req.category}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Proposal"
            fullWidth
            multiline
            rows={3}
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Price"
            type="number"
            fullWidth
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyDialog({ open: false, req: null })}>Cancel</Button>
          <Button onClick={handleSubmitProposal} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
      {/* Edit Proposal Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, request: null })}>
        <DialogTitle>Edit Proposal</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Proposal"
            fullWidth
            multiline
            rows={3}
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Price"
            type="number"
            fullWidth
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, request: null })}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Withdraw Proposal Dialog */}
      <Dialog open={withdrawDialog.open} onClose={() => setWithdrawDialog({ open: false, request: null })}>
        <DialogTitle>Withdraw Proposal</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to withdraw this proposal?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawDialog({ open: false, request: null })}>Cancel</Button>
          <Button onClick={handleWithdrawConfirm} color="error" variant="contained">Withdraw</Button>
        </DialogActions>
      </Dialog>
      {/* Add Portfolio Dialog */}
      <Dialog open={portfolioDialog.open} onClose={() => setPortfolioDialog({ open: false, type: 'image' })}>
        <DialogTitle>Add {portfolioDialog.type === 'image' ? 'Image' : 'Video'} to Portfolio</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="URL"
            fullWidth
            value={portfolioItem.url}
            onChange={(e) => setPortfolioItem({ ...portfolioItem, url: e.target.value })}
            placeholder={portfolioDialog.type === 'image' ? 'Image URL' : 'Video URL'}
          />
          <TextField
            margin="dense"
            label="Caption"
            fullWidth
            value={portfolioItem.caption}
            onChange={(e) => setPortfolioItem({ ...portfolioItem, caption: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Category"
            fullWidth
            select
            value={portfolioItem.category}
            onChange={(e) => setPortfolioItem({ ...portfolioItem, category: e.target.value })}
          >
            <MenuItem value="Catering">Catering</MenuItem>
            <MenuItem value="Photography">Photography</MenuItem>
            <MenuItem value="Decoration">Decoration</MenuItem>
            <MenuItem value="Music">Music</MenuItem>
            <MenuItem value="Makeup">Makeup</MenuItem>
            <MenuItem value="Venue">Venue</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPortfolioDialog({ open: false, type: 'image' })}>Cancel</Button>
          <Button onClick={handleAddPortfolioItem} variant="contained">Add</Button>
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
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default VendorRequests; 