import express from 'express';
import { Apoderado } from '../models/Apoderado.js';

const router = express.Router();

// Obtener todos los apoderados
router.get('/apoderados', async (req, res) => {
  try {
    const apoderados = await Apoderado.find(); // Obtiene todos los documentos
    res.json(apoderados);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los apoderados' });
  }
});

export default router;
