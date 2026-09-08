import { createTheme } from '@mui/material/styles';

export function getAppTheme(mode = 'light') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#3b82f6' : '#1a73e8',
        light: isDark ? '#60a5fa' : '#e8f0fe',
        dark: isDark ? '#2563eb' : '#1557b0',
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? '#22c55e' : '#1e8e3e',
        light: isDark ? '#14532d' : '#e6f4ea',
        dark: isDark ? '#16a34a' : '#137333',
      },
      warning: {
        main: isDark ? '#f59e0b' : '#f9ab00',
        light: isDark ? '#78350f' : '#fef7e0',
        dark: isDark ? '#d97706' : '#b06000',
      },
      error: {
        main: isDark ? '#ef4444' : '#d93025',
        light: isDark ? '#7f1d1d' : '#fce8e6',
        dark: isDark ? '#dc2626' : '#b31412',
      },
      background: {
        default: isDark ? '#0b0f19' : '#f8fafd',
        paper: isDark ? '#151c2e' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f1f5f9' : '#202124',
        secondary: isDark ? '#94a3b8' : '#5f6368',
        disabled: isDark ? '#64748b' : '#80868b',
      },
      divider: isDark ? '#26344d' : '#e0e2e6',
    },
    typography: {
      fontFamily: '"Google Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.5px',
      },
      h5: {
        fontWeight: 600,
        letterSpacing: '-0.2px',
      },
      h6: {
        fontWeight: 600,
        letterSpacing: '-0.1px',
      },
      subtitle1: {
        fontWeight: 600,
        fontSize: '0.95rem',
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? '#0b0f19' : '#f8fafd',
            color: isDark ? '#f1f5f9' : '#202124',
            transition: 'background-color 0.25s ease, color 0.25s ease',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            padding: '8px 18px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: isDark
                ? '0 2px 6px rgba(0,0,0,0.4)'
                : '0 1px 3px 0 rgba(60,64,67,0.25)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: isDark ? '#151c2e' : '#ffffff',
            boxShadow: isDark
              ? '0 4px 16px rgba(0,0,0,0.3)'
              : '0 1px 3px rgba(60,64,67,0.08), 0 2px 8px rgba(60,64,67,0.04)',
            border: `1px solid ${isDark ? '#26344d' : '#e0e2e6'}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? '#151c2e' : '#ffffff',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: isDark ? '#1c253b' : '#ffffff',
            '& fieldset': {
              borderColor: isDark ? '#2e3e5c' : '#dadce0',
            },
            '&:hover fieldset': {
              borderColor: isDark ? '#3b82f6' : '#1a73e8',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 4,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 3,
            height: 6,
            backgroundColor: isDark ? '#1e293b' : '#e8f0fe',
          },
          bar: {
            borderRadius: 3,
            backgroundColor: isDark ? '#3b82f6' : '#1a73e8',
          },
        },
      },
    },
  });
}

// Default light theme for backward compatibility
export const googleTheme = getAppTheme('light');
