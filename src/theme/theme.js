import { createTheme } from '@mui/material/styles';

export const getTheme = (mode = 'dark') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#36CFFF' : '#0284C7',
        light: isDark ? '#75DFFF' : '#38BDF8',
        dark: isDark ? '#00B4D8' : '#0369A1',
        contrastText: isDark ? '#071526' : '#FFFFFF',
      },
      secondary: {
        main: isDark ? '#75DFFF' : '#0EA5E9',
        contrastText: isDark ? '#071526' : '#FFFFFF',
      },
      background: {
        default: isDark ? '#071526' : '#F1F5F9',
        paper: isDark ? '#0B1A2E' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#F4F8FF' : '#0F172A',
        secondary: isDark ? '#94A8C0' : '#64748B',
        disabled: isDark ? '#4A607A' : '#94A3B8',
      },
      divider: isDark ? '#294B70' : '#E2E8F0',
      action: {
        active: isDark ? '#36CFFF' : '#0284C7',
        hover: isDark ? 'rgba(54, 207, 255, 0.08)' : 'rgba(2, 132, 199, 0.08)',
        selected: isDark ? 'rgba(54, 207, 255, 0.16)' : 'rgba(2, 132, 199, 0.14)',
      },
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      h1: {
        fontWeight: 700,
        letterSpacing: '-0.5px',
        color: isDark ? '#F4F8FF' : '#0F172A',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.5px',
        color: isDark ? '#F4F8FF' : '#0F172A',
      },
      h4: {
        fontWeight: 700,
        color: isDark ? '#F4F8FF' : '#0F172A',
      },
      h5: {
        fontWeight: 600,
        color: isDark ? '#F4F8FF' : '#0F172A',
      },
      h6: {
        fontWeight: 600,
        color: isDark ? '#F4F8FF' : '#0F172A',
      },
      subtitle1: {
        color: isDark ? '#94A8C0' : '#64748B',
      },
      subtitle2: {
        color: isDark ? '#94A8C0' : '#64748B',
      },
      body1: {
        color: isDark ? '#F4F8FF' : '#0F172A',
      },
      body2: {
        color: isDark ? '#94A8C0' : '#64748B',
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
            backgroundColor: isDark ? '#071526' : '#F1F5F9',
            color: isDark ? '#F4F8FF' : '#0F172A',
            transition: 'background-color 0.3s ease, color 0.3s ease',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? 'rgba(11, 26, 46, 0.78)' : 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${isDark ? 'rgba(54, 207, 255, 0.22)' : 'rgba(2, 132, 199, 0.18)'}`,
            borderRadius: '8px',
            boxShadow: isDark
              ? '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(54, 207, 255, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
              : '0 10px 30px rgba(15, 23, 42, 0.08), 0 0 20px rgba(2, 132, 199, 0.06)',
            transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
            '@media (max-width: 600px)': {
              borderRadius: '8px',
              boxShadow: isDark
                ? '0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(54, 207, 255, 0.08)'
                : '0 6px 18px rgba(15, 23, 42, 0.06)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? 'rgba(11, 26, 46, 0.78)' : 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${isDark ? 'rgba(54, 207, 255, 0.22)' : 'rgba(2, 132, 199, 0.18)'}`,
            borderRadius: '8px',
            boxShadow: isDark
              ? '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(54, 207, 255, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
              : '0 10px 30px rgba(15, 23, 42, 0.08), 0 0 20px rgba(2, 132, 199, 0.06)',
            transition: 'all 0.3s ease',
            '@media (max-width: 600px)': {
              borderRadius: '8px',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            padding: '10px 22px',
            fontSize: '0.95rem',
            fontWeight: 600,
            transition: 'all 0.25s ease',
            '@media (max-width: 600px)': {
              padding: '6px 14px',
              fontSize: '0.82rem',
              borderRadius: '8px',
              minHeight: '34px',
            },
          },
          containedPrimary: {
            background: isDark
              ? 'linear-gradient(135deg, #00B4D8 0%, #36CFFF 60%, #75DFFF 100%)'
              : 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)',
            color: isDark ? '#071526' : '#FFFFFF',
            boxShadow: isDark
              ? '0 4px 20px rgba(54, 207, 255, 0.35)'
              : '0 4px 16px rgba(2, 132, 199, 0.3)',
            '&:hover': {
              background: isDark
                ? 'linear-gradient(135deg, #36CFFF 0%, #75DFFF 100%)'
                : 'linear-gradient(135deg, #0369A1 0%, #0284C7 100%)',
              boxShadow: isDark
                ? '0 6px 25px rgba(54, 207, 255, 0.55)'
                : '0 6px 20px rgba(2, 132, 199, 0.45)',
              transform: 'translateY(-1px)',
            },
          },
          outlinedPrimary: {
            borderColor: isDark ? '#294B70' : '#CBD5E1',
            color: isDark ? '#36CFFF' : '#0284C7',
            '&:hover': {
              borderColor: isDark ? '#36CFFF' : '#0284C7',
              backgroundColor: isDark ? 'rgba(54, 207, 255, 0.08)' : 'rgba(2, 132, 199, 0.08)',
              boxShadow: isDark
                ? '0 0 15px rgba(54, 207, 255, 0.25)'
                : '0 0 15px rgba(2, 132, 199, 0.15)',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(16, 36, 61, 0.55)' : 'rgba(255, 255, 255, 0.95)',
            borderRadius: '8px',
            color: isDark ? '#F4F8FF' : '#0F172A',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease',
            '@media (max-width: 600px)': {
              borderRadius: '8px',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#294B70' : '#CBD5E1',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#36CFFF' : '#0284C7',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#36CFFF' : '#0284C7',
              borderWidth: '1.5px',
            },
            '&.Mui-focused': {
              boxShadow: isDark
                ? '0 0 15px rgba(54, 207, 255, 0.3)'
                : '0 0 15px rgba(2, 132, 199, 0.2)',
            },
          },
          input: {
            padding: '13px 16px',
            '@media (max-width: 600px)': {
              padding: '9px 12px',
              fontSize: '0.84rem',
            },
            '&::placeholder': {
              color: isDark ? '#94A8C0' : '#94A3B8',
              opacity: 1,
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: isDark ? '#94A8C0' : '#64748B',
            '@media (max-width: 600px)': {
              fontSize: '0.85rem',
            },
            '&.Mui-focused': {
              color: isDark ? '#36CFFF' : '#0284C7',
            },
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: isDark ? '#294B70' : '#CBD5E1',
            '@media (max-width: 600px)': {
              padding: '6px',
            },
            '&.Mui-checked': {
              color: isDark ? '#36CFFF' : '#0284C7',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: '8px',
            '@media (max-width: 600px)': {
              height: '22px',
              fontSize: '0.72rem',
              borderRadius: '8px',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '@media (max-width: 600px)': {
              padding: '5px',
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: '8px !important',
            '@media (max-width: 600px)': {
              margin: '8px !important',
              width: 'calc(100% - 16px) !important',
              maxWidth: '100% !important',
              borderRadius: '8px !important',
            },
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            '@media (max-width: 600px)': {
              padding: '8px 12px !important',
              fontSize: '1.05rem !important',
            },
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            '@media (max-width: 600px)': {
              padding: '8px 12px !important',
            },
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            '@media (max-width: 600px)': {
              padding: '8px 14px 12px !important',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            '@media (max-width: 600px)': {
              padding: '6px 8px',
              fontSize: '0.78rem',
            },
          },
        },
      },
    },
  });
};

export const theme = getTheme('dark');
export default theme;
