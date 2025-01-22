import React, { useState, useEffect, useContext } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Typography, Input } from '@mui/material';
import Grid from "@mui/material/Grid";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { blue, grey } from '@mui/material/colors';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { HuePicker } from 'react-color';
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from "notistack";
import MyContext from '../Context';
import { styled } from '@mui/system';

const theme = createTheme({
  palette: {
    primary: {
      main: blue[700],
    },
    secondary: {
      main: grey[400],
    },
  },
});

const CustomTable = styled(Table)(({ theme }) => ({
  border: `3px solid ${theme.palette.primary.main}`,
  '& thead th': {
    background: '#191919',
    color: 'white',
    borderBottom: `3px solid ${theme.palette.primary.main}`,
    borderRight: `3px solid ${theme.palette.primary.main}`,
    fontSize: '1.5rem',
  },
  '& tbody td': {
    background: '#191919',
    color: 'white',
    borderLeft: '2px solid black',
    borderBottom: '2px solid black',
    fontSize: '1rem',
  },
  '& tbody tr:last-child td': {
    borderBottom: 'none',
  },
}));

function FormularioCategoria() {
  const { control, handleSubmit, reset, formState: { errors } } = useForm();
  const [color, setColor] = useState('#ffffff');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { forceUpdate } = useContext(MyContext);
  const [categorias, setCategorias] = useState([]);
  const [editingCategoria, setEditingCategoria] = useState(null);

  const volverMain = () => {
    navigate('/');
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3001/categorias');
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error('Error fetching data de la API:', error);
    }
  };

  const handleChange = (newColor) => {
    setColor(newColor.hex);
  };

  const onSubmit = async (data) => {
    try {
      if (editingCategoria) {
        data.categoriaColor = color;
        await axios.put(`http://localhost:3001/categorias/${editingCategoria.id}`, data);
      } else {
        data.categoriaColor = data.categoriaColor || color;
        await axios.post('http://localhost:3001/categorias', data);
      }
      enqueueSnackbar(
        editingCategoria
          ? 'Categoria actualizada correctamente'
          : 'Categoria agregada correctamente',
        { variant: 'success' }
      );
      volverMain();
      forceUpdate();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Hubo un problema y la categoria no pudo ser guardada', {
        variant: 'error',
      });
    }
  };

  const deleteCategoria = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/categorias/${id}`);
      fetchData();
      forceUpdate();
      enqueueSnackbar('Categoría borrada correctamente', { variant: 'success' });
    } catch (error) {
      console.error(error);
    }
  };

  const editCategoria = (id) => {
    const categoria = categorias.find((c) => c.id === id);
    reset({
      categoriaNombre: categoria.categoriaNombre,
      categoriaTexto: categoria.categoriaTexto,
      categoriaColor: categoria.categoriaColor,
      codigoSeguridad: categoria.codigoSeguridad,
    });
    setColor(categoria.categoriaColor);
    setEditingCategoria(categoria);
  };

  const resetForm = () => {
    reset();
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ height: "auto", backgroundColor: '#191919', paddingTop: '1rem', paddingBottom: '2rem', minWidth: '320px' }}>
        <Container maxWidth="xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography align='center' variant='h3' color="#ffffff">Nueva Categoria</Typography>
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="categoriaNombre"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Nombre de categoria es requerido' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      variant="filled"
                      label="Nombre"
                      fullWidth
                      error={!!errors.categoriaNombre}
                      helperText={errors.categoriaNombre?.message}
                      sx={{ backgroundColor: '#53585D', color: 'white' }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="categoriaTexto"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'La descripcion es requerida' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      variant="filled"
                      label="Descripción"
                      fullWidth
                      multiline
                      rows={4}
                      error={!!errors.categoriaTexto}
                      helperText={errors.categoriaTexto?.message}
                      sx={{ backgroundColor: '#53585D', color: 'white' }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <HuePicker width="100%" color={color} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <ButtonGroup>
                  <Button type="submit" color="primary">Guardar</Button>
                  <Button onClick={resetForm} color="secondary">Limpiar</Button>
                </ButtonGroup>
              </Grid>
            </Grid>
          </form>
          <TableContainer component={Paper} sx={{ marginTop: '2rem' }}>
            <CustomTable>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Editar</TableCell>
                  <TableCell>Eliminar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categorias.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.categoriaNombre}</TableCell>
                    <TableCell>{row.categoriaTexto}</TableCell>
                    <TableCell><Button onClick={() => editCategoria(row.id)}>Editar</Button></TableCell>
                    <TableCell><Button onClick={() => deleteCategoria(row.id)} color="error">Eliminar</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </CustomTable>
          </TableContainer>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default FormularioCategoria;
