import express from 'express';
import { Colaborador } from '../models/Colaborador.js';

const router = express.Router();

// Obtener todos los coalboradores
router.get('/colaboradores', async (req, res) => {
  try {
    const colaboradores = await Colaborador.find(); // Obtiene todos los documentos
    res.json(colaboradores);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los colaboradores' });
  }
});

export default router;
