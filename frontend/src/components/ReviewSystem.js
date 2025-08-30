import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { format } from 'date-fns';

const ReviewSystem = ({ vendorId, eventId }) => {
  const [reviews, setReviews] = useState([]);
  const [open, setOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    categories: [],
  });
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    categoryRatings: {},
  });

  useEffect(() => {
    fetchReviews();
  }, [vendorId]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/vendors/${vendorId}/reviews`);
      setReviews(response.data.reviews);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async () => {
    try {
      await axios.post(`/vendors/${vendorId}/reviews`, {
        ...newReview,
        eventId,
      });
      setOpen(false);
      setNewReview({ rating: 0, comment: '', categories: [] });
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(`/reviews/${reviewId}`);
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const handleEditReview = async (reviewId, updatedReview) => {
    try {
      await axios.put(`/reviews/${reviewId}`, updatedReview);
      fetchReviews();
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  return (
    <Box>
      {/* Review Stats */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {stats.averageRating.toFixed(1)}
                </Typography>
                <Rating
                  value={stats.averageRating}
                  precision={0.5}
                  readOnly
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Based on {stats.totalReviews} reviews
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box>
                {Object.entries(stats.categoryRatings).map(([category, rating]) => (
                  <Box key={category} sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      {category}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={rating} precision={0.5} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">
                        {rating.toFixed(1)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Review List */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Reviews
          </Typography>
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
              },
            }}
          >
            Write a Review
          </Button>
        </Box>

        {reviews.map((review) => (
          <Card key={review._id} sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={review.user.avatar} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {review.user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(review.createdAt), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => handleEditReview(review._id, review)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteReview(review._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

              <Rating value={review.rating} readOnly sx={{ mb: 1 }} />
              <Typography variant="body1" sx={{ mb: 2 }}>
                {review.comment}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {review.categories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    size="small"
                    sx={{ borderRadius: 1 }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Review Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography component="legend">Rating</Typography>
            <Rating
              value={newReview.rating}
              onChange={(event, newValue) => {
                setNewReview({ ...newReview, rating: newValue });
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Review"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Categories</InputLabel>
              <Select
                multiple
                value={newReview.categories}
                onChange={(e) => setNewReview({ ...newReview, categories: e.target.value })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="Professionalism">Professionalism</MenuItem>
                <MenuItem value="Quality">Quality</MenuItem>
                <MenuItem value="Communication">Communication</MenuItem>
                <MenuItem value="Value">Value</MenuItem>
                <MenuItem value="Timeliness">Timeliness</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={!newReview.rating || !newReview.comment}
            sx={{
              background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
              },
            }}
          >
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewSystem; 