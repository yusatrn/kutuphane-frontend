import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import api from '../services/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    ad: '',
    aciklama: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/kategoriler');
      setCategories(response.data);
    } catch (error) {
      setError('Kategoriler yüklenirken bir hata oluştu.');
    }
  };

  const handleOpenDialog = (category = null) => {
    setSelectedCategory(category);
    if (category) {
      setFormData({
        ad: category.ad,
        aciklama: category.aciklama || ''
      });
    } else {
      setFormData({
        ad: '',
        aciklama: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
    setFormData({
      ad: '',
      aciklama: ''
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedCategory) {
        await api.put(`/api/kategoriler/${selectedCategory.id}`, formData);
        setSuccess('Kategori başarıyla güncellendi.');
      } else {
        await api.post('/api/kategoriler', formData);
        setSuccess('Kategori başarıyla eklendi.');
      }
      fetchCategories();
      handleCloseDialog();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Kategori kaydedilirken bir hata oluştu.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      try {
        await api.delete(`/api/kategoriler/${id}`);
        setSuccess('Kategori başarıyla silindi.');
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Kategori silinirken bir hata oluştu.');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
          <CategoryIcon sx={{ mr: 1 }} /> Kategoriler
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Yeni Kategori Ekle
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kategori Adı</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.ad}</TableCell>
                <TableCell>{category.aciklama || '-'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(category)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(category.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Kategori Adı"
            fullWidth
            required
            value={formData.ad}
            onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Açıklama"
            fullWidth
            multiline
            rows={3}
            value={formData.aciklama}
            onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedCategory ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories; 