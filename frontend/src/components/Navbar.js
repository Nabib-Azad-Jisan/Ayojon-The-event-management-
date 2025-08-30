import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Container,
  Badge,
  useScrollTrigger,
  Slide,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Switch,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Message as MessageIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Celebration as CelebrationIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Navbar = ({ mode, setMode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Fetch notifications for vendor
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user && user.role === 'vendor') {
        setLoadingNotifications(true);
        try {
          const res = await axios.get('/vendors/notifications');
          setNotifications(res.data);
        } catch (err) {
          setNotifications([]);
        } finally {
          setLoadingNotifications(false);
        }
      }
    };
    fetchNotifications();
  }, [user]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  // Notification menu handlers
  const handleNotifClick = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };
  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <HideOnScroll>
      <AppBar 
        position="fixed" 
        sx={{ 
          background: scrolled 
            ? 'rgba(35, 37, 38, 0.8)' 
            : 'rgba(35, 37, 38, 0.6)',
          backdropFilter: 'blur(10px)',
          boxShadow: scrolled 
            ? '0 4px 30px rgba(0, 0, 0, 0.1)' 
            : 'none',
          borderBottom: scrolled 
            ? '1px solid rgba(255, 255, 255, 0.1)' 
            : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography
              variant="h5"
              component={RouterLink}
              to="/"
              sx={{
                flexGrow: 1,
                textDecoration: 'none',
                color: 'transparent',
                fontWeight: 700,
                letterSpacing: '-0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                background: 'linear-gradient(90deg, #FF6B6B, #FF8E53 60%, #45B7D1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: `'Noto Sans Bengali', 'SolaimanLipi', 'Hind Siliguri', 'Kalpurush', 'Arial', sans-serif`,
                fontSize: { xs: '1.5rem', sm: '2.2rem' },
                textShadow: '0 2px 8px rgba(255,107,107,0.10)',
                transition: 'color 0.3s',
              }}
            >
              <CelebrationIcon sx={{ 
                fontSize: 32, 
                color: 'white', 
                filter: 'drop-shadow(0 2px 8px rgba(255,107,107,0.15))',
                transition: 'all 0.3s ease',
              }} />
              আয়োজন
            </Typography>

            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                  size="large"
                  aria-label="show notifications"
                  sx={{
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                  onClick={handleNotifClick}
                >
                  <Badge badgeContent={user.role === 'vendor' ? unreadCount : 0} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                  <IconButton
                    sx={{ 
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                    onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
                  >
                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                  </IconButton>
                </Tooltip>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  sx={{
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main',
                      width: 36,
                      height: 36,
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                      }
                    }}
                  >
                    {user.name.charAt(0)}
                  </Avatar>
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      background: 'rgba(35, 37, 38, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      mt: 1.5,
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        background: 'rgba(35, 37, 38, 0.9)',
                        backdropFilter: 'blur(10px)',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  }}
                >
                  <MenuItem 
                    component={RouterLink} 
                    to={user.role === 'vendor' ? '/vendor-requests' : '/dashboard'} 
                    onClick={handleClose}
                    sx={{
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <DashboardIcon fontSize="small" sx={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText>Dashboard</ListItemText>
                  </MenuItem>
                  <MenuItem 
                    component={RouterLink} 
                    to="/messages" 
                    onClick={handleClose}
                    sx={{
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <MessageIcon fontSize="small" sx={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText>Messages</ListItemText>
                  </MenuItem>
                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" sx={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                  <IconButton
                    sx={{ 
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                    onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
                  >
                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                  </IconButton>
                </Tooltip>
                <Button
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                  variant="outlined"
                >
                  Login
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
    </HideOnScroll>
  );
};

export default Navbar; 