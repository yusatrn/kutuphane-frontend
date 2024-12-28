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
  TablePagination,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Book as BookIcon
} from '@mui/icons-material';
import api from '../services/api';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    ad: '',
    yazar: '',
    isbn: '',
    yayinevi: '',
    yayinYili: '',
    stokDurumu: '',
    kategoriId: ''
  });

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await api.get('/api/kitaplar');
      const formattedBooks = response.data.map(book => ({
        id: book.id,
        ad: book.ad || 'İsimsiz Kitap',
        yazar: book.yazar || 'Yazar Belirtilmemiş',
        isbn: book.isbn || '-',
        yayinevi: book.yayinevi || '-',
        yayinYili: book.yayinYili || '-',
        stokDurumu: book.stokDurumu || 0,
        kategoriId: book.kategoriId || ''
      }));
      setBooks(formattedBooks);
    } catch (error) {
      console.error('Kitaplar yüklenirken hata:', error);
      setError('Kitaplar yüklenirken bir hata oluştu.');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/kategoriler');
      setCategories(response.data);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (book = null) => {
    setSelectedBook(book);
    if (book) {
      setFormData({
        ad: book.ad,
        yazar: book.yazar,
        isbn: book.isbn,
        yayinevi: book.yayinevi,
        yayinYili: book.yayinYili,
        stokDurumu: book.stokDurumu,
        kategoriId: book.kategoriId
      });
    } else {
      setFormData({
        ad: '',
        yazar: '',
        isbn: '',
        yayinevi: '',
        yayinYili: '',
        stokDurumu: '',
        kategoriId: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBook(null);
    setFormData({
      ad: '',
      yazar: '',
      isbn: '',
      yayinevi: '',
      yayinYili: '',
      stokDurumu: '',
      kategoriId: ''
    });
  };

  const handleSubmit = async () => {
    try {
      const bookData = {
        ad: formData.ad,
        yazar: formData.yazar,
        isbn: formData.isbn,
        yayinevi: formData.yayinevi,
        yayinYili: parseInt(formData.yayinYili) || new Date().getFullYear(),
        stokDurumu: parseInt(formData.stokDurumu) || 0,
        kategoriId: formData.kategoriId
      };

      if (selectedBook) {
        await api.put(`/api/kitaplar/${selectedBook.id}`, bookData);
      } else {
        await api.post('/api/kitaplar', bookData);
      }
      fetchBooks();
      handleCloseDialog();
    } catch (error) {
      console.error('Kitap kaydedilirken hata:', error);
      setError('Kitap kaydedilirken bir hata oluştu.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu kitabı silmek istediğinizden emin misiniz?')) {
      try {
        await api.delete(`/api/kitaplar/${id}`);
        fetchBooks();
      } catch (error) {
        setError('Kitap silinirken bir hata oluştu.');
      }
    }
  };

  const generateYearList = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1000; year--) {
      years.push(year);
    }
    return years;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
          <BookIcon sx={{ mr: 1 }} /> Kitaplar
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Yeni Kitap Ekle
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kitap Adı</TableCell>
              <TableCell>Yazar</TableCell>
              <TableCell>ISBN</TableCell>
              <TableCell>Yayınevi</TableCell>
              <TableCell>Yayın Yılı</TableCell>
              <TableCell>Stok</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((book) => (
                <TableRow key={book.id}>
                  <TableCell>{book.ad}</TableCell>
                  <TableCell>{book.yazar}</TableCell>
                  <TableCell>{book.isbn}</TableCell>
                  <TableCell>{book.yayinevi}</TableCell>
                  <TableCell>{book.yayinYili}</TableCell>
                  <TableCell>{book.stokDurumu}</TableCell>
                  <TableCell>
                    {categories.find(c => c.id === book.kategoriId)?.ad || '-'}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(book)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(book.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={books.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedBook ? 'Kitap Düzenle' : 'Yeni Kitap Ekle'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Kitap Adı"
            fullWidth
            value={formData.ad}
            onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Yazar"
            fullWidth
            value={formData.yazar}
            onChange={(e) => setFormData({ ...formData, yazar: e.target.value })}
          />
          <TextField
            margin="dense"
            label="ISBN"
            fullWidth
            value={formData.isbn}
            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Yayınevi"
            fullWidth
            value={formData.yayinevi}
            onChange={(e) => setFormData({ ...formData, yayinevi: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Yayın Yılı</InputLabel>
            <Select
              value={formData.yayinYili}
              label="Yayın Yılı"
              onChange={(e) => setFormData({ ...formData, yayinYili: e.target.value })}
            >
              <MenuItem value="">
                <em>Seçiniz</em>
              </MenuItem>
              {generateYearList().map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Stok Durumu"
            fullWidth
            type="number"
            value={formData.stokDurumu}
            onChange={(e) => setFormData({ ...formData, stokDurumu: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Kategori</InputLabel>
            <Select
              value={formData.kategoriId}
              label="Kategori"
              onChange={(e) => setFormData({ ...formData, kategoriId: e.target.value })}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.ad}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedBook ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Books; 