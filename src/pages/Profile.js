import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  Book as BookIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loanHistory, setLoanHistory] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    telefon: '',
    eskiSifre: '',
    yeniSifre: '',
    yeniSifreTekrar: ''
  });

  useEffect(() => {
    fetchProfileData();
    fetchLoanHistory();
    fetchPenalties();
  }, []);

  const fetchProfileData = async () => {
    try {
      console.log('User:', user);
      const response = await api.post('/api/uyeler/detay', { 
        uyeId: user.id || user.email
      });
      setProfileData(response.data);
      setFormData({
        ...formData,
        ad: response.data.ad,
        soyad: response.data.soyad,
        telefon: response.data.telefon
      });
    } catch (error) {
      console.error('Profile error:', error);
      setError('Profil bilgileri yüklenirken bir hata oluştu.');
    }
  };

  const fetchLoanHistory = async () => {
    try {
      const response = await api.post('/api/odunc/uye/listele', { uyeId: user.id });
      setLoanHistory(response.data);
    } catch (error) {
      console.error('Ödünç geçmişi yüklenirken hata:', error);
    }
  };

  const fetchPenalties = async () => {
    try {
      const response = await api.get(`/api/cezalar/uye/${user.id}`);
      setPenalties(response.data);
    } catch (error) {
      console.error('Cezalar yüklenirken hata:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await api.post('/api/uyeler/bilgi-guncelle', {
        uyeId: user.id,
        ad: formData.ad,
        soyad: formData.soyad,
        telefon: formData.telefon
      });
      setSuccess('Profil bilgileri başarıyla güncellendi.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Profil güncellenirken bir hata oluştu.');
    }
  };

  const handleUpdatePassword = async () => {
    if (formData.yeniSifre !== formData.yeniSifreTekrar) {
      setError('Yeni şifreler eşleşmiyor.');
      return;
    }

    try {
      await api.post('/api/uyeler/sifre-guncelle', {
        uyeId: user.id,
        eskiSifre: formData.eskiSifre,
        yeniSifre: formData.yeniSifre
      });
      setSuccess('Şifre başarıyla güncellendi.');
      setFormData({
        ...formData,
        eskiSifre: '',
        yeniSifre: '',
        yeniSifreTekrar: ''
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Şifre güncellenirken bir hata oluştu.');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <PersonIcon sx={{ mr: 1 }} /> Profilim
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Kişisel Bilgiler
            </Typography>
            <TextField
              margin="normal"
              fullWidth
              label="Ad"
              value={formData.ad}
              onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Soyad"
              value={formData.soyad}
              onChange={(e) => setFormData({ ...formData, soyad: e.target.value })}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Telefon"
              value={formData.telefon}
              onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
            />
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleUpdateProfile}
            >
              Bilgileri Güncelle
            </Button>
          </Paper>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Şifre Değiştir
            </Typography>
            <TextField
              margin="normal"
              fullWidth
              label="Mevcut Şifre"
              type="password"
              value={formData.eskiSifre}
              onChange={(e) => setFormData({ ...formData, eskiSifre: e.target.value })}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Yeni Şifre"
              type="password"
              value={formData.yeniSifre}
              onChange={(e) => setFormData({ ...formData, yeniSifre: e.target.value })}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Yeni Şifre Tekrar"
              type="password"
              value={formData.yeniSifreTekrar}
              onChange={(e) => setFormData({ ...formData, yeniSifreTekrar: e.target.value })}
            />
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleUpdatePassword}
            >
              Şifre Değiştir
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <BookIcon sx={{ mr: 1 }} /> Ödünç Alma Geçmişi
            </Typography>
            <List>
              {loanHistory.map((loan) => (
                <ListItem key={loan.id} divider>
                  <ListItemText
                    primary={loan.kitap.baslik}
                    secondary={`Alış: ${new Date(loan.oduncAlmaTarihi).toLocaleDateString()} - 
                              İade: ${loan.iadeTarihi ? new Date(loan.iadeTarihi).toLocaleDateString() : 'Henüz İade Edilmedi'}`}
                  />
                  <Chip
                    label={loan.iadeTarihi ? 'İade Edildi' : 'Devam Ediyor'}
                    color={loan.iadeTarihi ? 'success' : 'warning'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <WarningIcon sx={{ mr: 1 }} /> Cezalar
            </Typography>
            <List>
              {penalties.map((penalty) => (
                <ListItem key={penalty.id} divider>
                  <ListItemText
                    primary={`Ceza Tutarı: ${penalty.cezaMiktari} TL`}
                    secondary={`Tarih: ${new Date(penalty.cezaTarihi).toLocaleDateString()} - Neden: ${penalty.cezaNedeni}`}
                  />
                  <Chip
                    label={penalty.odendi ? 'Ödendi' : 'Ödenmedi'}
                    color={penalty.odendi ? 'success' : 'error'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile; 