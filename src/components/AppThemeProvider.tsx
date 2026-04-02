"use client";

import {
  CssBaseline,
  GlobalStyles,
  ThemeProvider,
  createTheme,
} from "@mui/material";

const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#111111",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#52525b",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#111111",
      secondary: "#52525b",
    },
    divider: "rgba(17, 17, 17, 0.1)",
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'var(--font-sans), "Noto Sans SC", sans-serif',
    button: {
      fontWeight: 700,
      textTransform: "none",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#f5f5f5",
          color: "#111111",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 10,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 10,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingInline: 18,
          minHeight: 42,
        },
        outlined: {
          borderColor: "rgba(17, 17, 17, 0.12)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#ffffff",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export function AppThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          ".mui-dark-panel": {
            backgroundColor: "#111111",
            color: "#ffffff",
            border: "1px solid rgba(17, 17, 17, 0.9)",
            boxShadow: "0 24px 64px rgba(15, 23, 42, 0.16)",
          },
          ".mui-light-panel": {
            backgroundColor: "#ffffff",
            border: "1px solid rgba(17, 17, 17, 0.1)",
            boxShadow: "0 14px 36px rgba(15, 23, 42, 0.05)",
          },
        }}
      />
      {children}
    </ThemeProvider>
  );
}
