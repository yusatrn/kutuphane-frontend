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
  MenuItem,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  LibraryBooks as LoanIcon,
  AssignmentReturn as ReturnIcon
} from '@mui/icons-material';
import api from '../services/api';

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    uyeId: '',
    kitapId: '',
    oduncAlmaTarihi: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [oduncRes, kitaplarRes, uyelerRes] = await Promise.all([
          api.get('/api/odunc/listele'),
          api.get('/api/kitaplar'),
          api.post('/api/uyeler/listele')
        ]);
        
        setLoans(oduncRes.data);
        
        const mevcutKitaplar = kitaplarRes.data.filter(k => k.stokDurumu > 0);
        setBooks(mevcutKitaplar);
        setMembers(uyelerRes.data);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setError('Veriler yüklenirken bir hata oluştu');
      }
    };

    loadData();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = () => {
    setFormData({
      uyeId: '',
      kitapId: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setFormData({
      uyeId: '',
      kitapId: ''
    });
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.uyeId || !formData.kitapId) {
        setError('Üye ve kitap seçimi zorunludur');
        return;
      }

      const oduncData = {
        uyeId: formData.uyeId,
        kitapId: formData.kitapId,
        gunSayisi: 15
      };

      await api.post('/api/odunc/ver', oduncData);
      
      const response = await api.get('/api/odunc/listele');
      setLoans(response.data);
      
      setSuccess('Kitap başarıyla ödünç verildi');
      handleCloseDialog();
    } catch (error) {
      console.error('Ödünç verme hatası:', error);
      setError('Kitap ödünç verilirken bir hata oluştu');
    }
  };

  const handleReturn = async (oduncId) => {
    try {
      await api.post('/api/odunc/iade', { oduncId });
      
      const response = await api.get('/api/odunc/listele');
      setLoans(response.data);
      
      setSuccess('Kitap başarıyla iade alındı');
    } catch (error) {
      console.error('İade hatası:', error);
      setError('Kitap iade alınırken bir hata oluştu');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
          <LoanIcon sx={{ mr: 1 }} /> Ödünç İşlemleri
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Yeni Ödünç Ver
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Üye</TableCell>
              <TableCell>Kitap Adı</TableCell>
              <TableCell>Ödünç Alma Tarihi</TableCell>
              <TableCell>İade Tarihi</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loans
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>
                    {`${loan.uyeAdi} ${loan.uyeSoyadi}`}
                  </TableCell>
                  <TableCell>
                    {loan.kitapAdi || '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(loan.oduncAlmaTarihi).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {loan.iadeTarihi ? new Date(loan.iadeTarihi).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={!loan.aktif ? 'İade Edildi' : 'Ödünçte'}
                      color={!loan.aktif ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>
                    {loan.aktif && (
                      <IconButton onClick={() => handleReturn(loan.id)}>
                        <ReturnIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={loans.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Ödünç Verme</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Üye</InputLabel>
            <Select
              value={formData.uyeId}
              label="Üye"
              onChange={(e) => setFormData({ ...formData, uyeId: e.target.value })}
            >
              {members.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.ad} {member.soyad}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Kitap</InputLabel>
            <Select
              value={formData.kitapId}
              label="Kitap"
              onChange={(e) => setFormData({ ...formData, kitapId: e.target.value })}
            >
              {books
                .filter(book => book.stokDurumu > 0)
                .map((book) => (
                  <MenuItem key={book.id} value={book.id}>
                    {book.ad}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            Ödünç Ver
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Loans; 