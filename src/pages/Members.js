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
  MenuItem,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon
} from '@mui/icons-material';
import api from '../services/api';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    eposta: '',
    telefon: '',
    sifre: '',
    roller: []
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.post('/api/uyeler/listele');
      setMembers(response.data);
    } catch (error) {
      setError('Üyeler yüklenirken bir hata oluştu.');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (member = null) => {
    setSelectedMember(member);
    if (member) {
      setFormData({
        ad: member.ad,
        soyad: member.soyad,
        eposta: member.eposta,
        telefon: member.telefon,
        roller: member.roller || [],
        sifre: '' // Şifre alanını boş bırak
      });
    } else {
      setFormData({
        ad: '',
        soyad: '',
        eposta: '',
        telefon: '',
        sifre: '',
        roller: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMember(null);
    setFormData({
      ad: '',
      soyad: '',
      eposta: '',
      telefon: '',
      sifre: '',
      roller: []
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedMember) {
        await api.post('/api/uyeler/bilgi-guncelle', {
          ...formData,
          uyeId: selectedMember.id
        });
      } else {
        await api.post('/api/auth/kayit', formData);
      }
      fetchMembers();
      handleCloseDialog();
    } catch (error) {
      setError('Üye kaydedilirken bir hata oluştu.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu üyeyi silmek istediğinizden emin misiniz?')) {
      try {
        await api.post('/api/admin/uye-pasif-yap', { uyeId: id });
        fetchMembers();
      } catch (error) {
        setError('Üye silinirken bir hata oluştu.');
      }
    }
  };

  const handleRoleChange = async (memberId, role) => {
    try {
      if (role === 'ADMIN') {
        await api.post('/api/admin/admin-yap', { uyeId: memberId });
      } else if (role === 'KUTUPHANE_GOREVLISI') {
        await api.post('/api/admin/gorevli-yap', { uyeId: memberId });
      }
      fetchMembers();
    } catch (error) {
      setError('Rol değiştirilirken bir hata oluştu.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 1 }} /> Üyeler
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Yeni Üye Ekle
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ad Soyad</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>Roller</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{`${member.ad} ${member.soyad}`}</TableCell>
                  <TableCell>{member.eposta}</TableCell>
                  <TableCell>{member.telefon}</TableCell>
                  <TableCell>
                    {member.roller?.map((rol) => (
                      <Chip
                        key={rol}
                        label={rol === 'ADMIN' ? 'Admin' : rol === 'KUTUPHANE_GOREVLISI' ? 'Görevli' : 'Üye'}
                        color={rol === 'ADMIN' ? 'error' : rol === 'KUTUPHANE_GOREVLISI' ? 'warning' : 'default'}
                        size="small"
                        sx={{ mr: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    {member.aktif ? (
                      <Chip
                        icon={<ActiveIcon />}
                        label="Aktif"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<BlockIcon />}
                        label="Pasif"
                        color="error"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(member)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(member.id)}>
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
          count={members.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedMember ? 'Üye Düzenle' : 'Yeni Üye Ekle'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Ad"
            fullWidth
            value={formData.ad}
            onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Soyad"
            fullWidth
            value={formData.soyad}
            onChange={(e) => setFormData({ ...formData, soyad: e.target.value })}
          />
          <TextField
            margin="dense"
            label="E-posta"
            fullWidth
            type="email"
            value={formData.eposta}
            onChange={(e) => setFormData({ ...formData, eposta: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Telefon"
            fullWidth
            value={formData.telefon}
            onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
          />
          {!selectedMember && (
            <TextField
              margin="dense"
              label="Şifre"
              fullWidth
              type="password"
              value={formData.sifre}
              onChange={(e) => setFormData({ ...formData, sifre: e.target.value })}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedMember ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Members; 