import { createTheme } from '@mui/material/styles';

const getTheme = (mode = 'light', primaryColor = '#6C63FF') => createTheme({
  palette: {
    mode,
    primary: {
      main: primaryColor,
      light: '#A393FF',
      dark: '#3F3D56',
      contrastText: '#fff',
    },
    secondary: {
      main: '#00BFAE',
      light: '#5FFFD7',
      dark: '#008E76',
      contrastText: '#fff',
    },
    background: {
      default: mode === 'dark' ? '#181A20' : '#f7f8fa',
      paper: mode === 'dark' ? '#23272F' : '#ffffff',
    },
    error: {
      main: '#ff5252',
    },
    warning: {
      main: '#ffb300',
    },
    info: {
      main: '#2979ff',
    },
    success: {
      main: '#00c853',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.7rem',
      fontWeight: 700,
      letterSpacing: '-1px',
    },
    h2: {
      fontSize: '2.2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.8rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.2rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.5px',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '0 2px 8px rgba(108, 99, 255, 0.08)',
          transition: 'background 0.2s, box-shadow 0.2s',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 191, 174, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: '0 6px 24px rgba(108, 99, 255, 0.08)',
          transition: 'box-shadow 0.2s',
          '&:hover': {
            boxShadow: '0 12px 32px rgba(0, 191, 174, 0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
  },
});

export default getTheme; 