// routes/apoderado.js
import express from 'express';
import { Apoderado } from '../models/Apoderado.js';
import { Estudiante } from '../models/Estudiante.js'; // Asegúrate de importar el modelo de Estudiante

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

router.get('/apoderados/:id/estudiantes', async (req, res) => {
  try {
    const apoderadoId = req.params.id;
    const estudiantes = await Estudiante.find({ apoderadoId }); // Asegúrate de que apoderadoId esté correcto
    res.json(estudiantes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los estudiantes' });
  }
});

export default router;
