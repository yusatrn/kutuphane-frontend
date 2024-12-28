import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Books from './pages/Books';
import Members from './pages/Members';
import Profile from './pages/Profile';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Categories from './pages/Categories';
import Loans from './pages/Loans';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="books" element={<PrivateRoute><Books /></PrivateRoute>} />
              <Route path="categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
              <Route path="loans" element={<PrivateRoute><Loans /></PrivateRoute>} />
              <Route path="members" element={<PrivateRoute><Members /></PrivateRoute>} />
              <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
