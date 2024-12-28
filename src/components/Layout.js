import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, Button, IconButton, 
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  Box, Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Book as BookIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Home as HomeIcon,
  Category as CategoryIcon,
  LibraryBooks as LoanIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Ana Sayfa', icon: <HomeIcon />, path: '/' },
    { text: 'Kitaplar', icon: <BookIcon />, path: '/books' },
    { text: 'Kategoriler', icon: <CategoryIcon />, path: '/categories' },
    { text: 'Ödünç İşlemleri', icon: <LoanIcon />, path: '/loans' },
    { text: 'Üyeler', icon: <PeopleIcon />, path: '/members' },
    { text: 'Profilim', icon: <PersonIcon />, path: '/profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Kütüphane Yönetim Sistemi
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            {user?.sub}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Çıkış
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem 
                button 
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
            <Divider />
            <ListItem button onClick={handleLogout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Çıkış" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 