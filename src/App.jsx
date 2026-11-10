import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { CustomThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { MobileHeaderProvider } from './context/MobileHeaderContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <CustomThemeProvider>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <MobileHeaderProvider>
            <AppRoutes />
          </MobileHeaderProvider>
        </AuthProvider>
      </BrowserRouter>
    </CustomThemeProvider>
  );
}

export default App;
