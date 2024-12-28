import React, { useState, useEffect } from 'react';
import { 
  Grid, Card, CardContent, Typography, 
  Box, CircularProgress 
} from '@mui/material';
import {
  Book as BookIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  EventBusy as EventBusyIcon
} from '@mui/icons-material';
import api from '../services/api';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" color={color}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Home = () => {
  const [stats, setStats] = useState({
    kitapSayisi: 0,
    uyeSayisi: 0,
    gecikmeliKitapSayisi: 0,
    odenmemisCezaSayisi: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [kitaplar, uyeler, gecikmeliKitaplar, cezalar] = await Promise.all([
          api.get('/api/kitaplar'),
          api.post('/api/uyeler/listele'),
          api.get('/api/raporlar/gecikmeli-kitaplar'),
          api.get('/api/cezalar/odenmemis')
        ]);

        setStats({
          kitapSayisi: kitaplar.data?.length || 0,
          uyeSayisi: uyeler.data?.length || 0,
          gecikmeliKitapSayisi: gecikmeliKitaplar.data?.length || 0,
          odenmemisCezaSayisi: cezalar.data?.length || 0
        });
      } catch (error) {
        console.error('İstatistikler yüklenirken hata:', error);
        setError('İstatistikler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Kütüphane İstatistikleri
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Kitap"
            value={stats.kitapSayisi}
            icon={<BookIcon color="primary" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Üye"
            value={stats.uyeSayisi}
            icon={<PeopleIcon color="secondary" />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Gecikmeli Kitaplar"
            value={stats.gecikmeliKitapSayisi}
            icon={<EventBusyIcon sx={{ color: 'warning.main' }} />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ödenmemiş Cezalar"
            value={stats.odenmemisCezaSayisi}
            icon={<WarningIcon sx={{ color: 'error.main' }} />}
            color="error.main"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home; 