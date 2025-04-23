import express from 'express';
import { Grado } from '../models/Grado.js';

const router = express.Router();

// Obtener todos los grados
router.get('/grados', async (req, res) => {
  try {
    const grados = await Grado.find(); // Obtiene todos los documentos
    res.json(grados);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los grados' });
  }
});

// Actualizar la cantidad de vacantes de un grado
router.put('/grados/:id', async (req, res) => {
  try {
    const { vacante } = req.body;
    const gradoActualizado = await Grado.findByIdAndUpdate(
      req.params.id,
      { vacante },
      { new: true }
    );

    if (!gradoActualizado) {
      return res.status(404).json({ error: 'Grado no encontrado' });
    }

    res.json(gradoActualizado);
  } catch (error) {
    console.error('Error al actualizar vacantes:', error);
    res.status(500).json({ error: 'Error al actualizar vacantes' });
  }
});


export default router;
