import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Avatar,
  Fade,
  Stack,
  SvgIcon,
  useTheme
} from '@mui/material';
import { format } from 'date-fns';
import axios from 'axios';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GroupsIcon from '@mui/icons-material/Groups';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const testimonials = [
  {
    name: 'Ayesha Rahman',
    role: 'Bride',
    quote: 'Ayojon made my wedding stress-free and beautiful. The vendors were top-notch and the dashboard was so easy to use!',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    color: '#FF6B6B',
  },
  {
    name: 'Rohan Das',
    role: 'Corporate Client',
    quote: 'We managed our annual gala with Ayojon. Everything from catering to decoration was seamless!',
    avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
    color: '#4ECDC4',
  },
  {
    name: 'Priya Singh',
    role: 'Vendor',
    quote: 'Ayojon helped me connect with more clients and grow my business. Highly recommended for all vendors!',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    color: '#45B7D1',
  },
];

const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [fadeIn, setFadeIn] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const res = await axios.get('/events');
        setFeaturedEvents(res.data);
        setFadeIn(true);
      } catch (err) {
        console.error('Error fetching featured events:', err);
      }
    };
    fetchFeaturedEvents();
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          background: `linear-gradient(120deg, rgba(40,48,72,0.92) 0%, rgba(255,0,128,0.82) 100%), url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1500&q=80') center/cover no-repeat`,
          color: 'white',
          py: 10,
          textAlign: 'center',
          minHeight: 500,
          display: 'flex',
          alignItems: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(255,0,128,0.3) 0%, rgba(0,128,255,0.3) 100%)',
            zIndex: 1,
          }
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Typography 
            variant="h1" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              letterSpacing: '-2px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              animation: 'fadeInDown 1s ease-out'
            }}
          >
            Plan Your Perfect Event
          </Typography>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            sx={{ 
              mb: 4,
              textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
              animation: 'fadeInUp 1s ease-out'
            }}
          >
            Find vendors, manage events, and create unforgettable experiences
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              sx={{ 
                px: 4, 
                py: 1.5, 
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
                }
              }}
              onClick={() => navigate('/register')}
            >
              Get Started
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Featured Events Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          gutterBottom 
          align="center" 
          sx={{ 
            fontWeight: 600,
            color: 'primary.main',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 100,
              height: 4,
              background: 'linear-gradient(90deg, #FF6B6B, #FF8E53)',
              borderRadius: 2
            }
          }}
        >
          Explore Events
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {featuredEvents.length === 0 ? (
            <Typography variant="body1" align="center" sx={{ width: '100%', mt: 4 }}>
              No events found. Be the first to create one!
            </Typography>
          ) : (
            featuredEvents.map((event, idx) => (
              <Fade in={fadeIn} timeout={600 + idx * 200} key={event._id}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      border: '2px solid #f0f0f0',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.03)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                        borderColor: 'primary.main',
                      },
                    }}
                    onClick={() => navigate(`/events/${event._id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={event.images && event.images[0] ? `http://localhost:5000${event.images[0]}` : '/default-event.jpg'}
                      alt={event.title}
                      sx={{ objectFit: 'cover', borderRadius: '16px 16px 0 0' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 600 }}>
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
                          sx={{ 
                            background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                        <Button 
                          size="small" 
                          sx={{ 
                            color: 'primary.main',
                            fontWeight: 600,
                            '&:hover': {
                              background: 'rgba(255,107,107,0.1)'
                            }
                          }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Fade>
            ))
          )}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box sx={{
        py: 8,
        background: 'linear-gradient(120deg, #f7f8fa 0%, #e0c3fc 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 100,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.8), transparent)',
          zIndex: 1
        }
      }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h4" 
            align="center" 
            sx={{ 
              fontWeight: 600, 
              mb: 4,
              color: 'primary.main',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 80,
                height: 4,
                background: 'linear-gradient(90deg, #FF6B6B, #FF8E53)',
                borderRadius: 2
              }
            }}
          >
            What Our Users Say
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {testimonials.map((t, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Card 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    minHeight: 260, 
                    boxShadow: 3,
                    background: `linear-gradient(135deg, ${t.color}20 0%, ${t.color}40 100%)`,
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                >
                  <Avatar 
                    src={t.avatar} 
                    alt={t.name} 
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      mx: 'auto', 
                      mb: 2,
                      border: `3px solid ${t.color}`,
                      boxShadow: `0 0 10px ${t.color}`
                    }} 
                  />
                  <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                    " {t.quote} "
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: t.color }}>{t.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{t.role}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ 
        py: 8,
        background: 'linear-gradient(120deg, #f7f8fa 0%, #e0c3fc 100%)',
        position: 'relative'
      }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h4" 
            align="center" 
            sx={{ 
              fontWeight: 600, 
              mb: 6,
              color: 'primary.main',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 80,
                height: 4,
                background: 'linear-gradient(90deg, #FF6B6B, #FF8E53)',
                borderRadius: 2
              }
            }}
          >
            Why Choose Ayojon?
          </Typography>
          <Grid container spacing={6} justifyContent="center">
            <Grid item xs={12} md={4}>
              <Stack alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(255,107,107,0.3)'
                  }}
                >
                  <SvgIcon component={EventAvailableIcon} sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h6" align="center" sx={{ fontWeight: 600 }}>
                  Easy Event Management
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary">
                  Create and manage your events with our intuitive dashboard
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #4ECDC4 30%, #45B7D1 90%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(78,205,196,0.3)'
                  }}
                >
                  <SvgIcon component={GroupsIcon} sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h6" align="center" sx={{ fontWeight: 600 }}>
                  Connect with Vendors
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary">
                  Find and connect with the best vendors for your event
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(255,142,83,0.3)'
                  }}
                >
                  <SvgIcon component={DashboardCustomizeIcon} sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h6" align="center" sx={{ fontWeight: 600 }}>
                  Customize Your Event
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary">
                  Personalize every aspect of your event to make it unique
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 