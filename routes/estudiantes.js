// routes/estudiantes.js
import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { Estudiante } from '../models/Estudiante.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Conexión con GridFSBucket
let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });
});

// Ruta para subir imagen de estudiante
router.post('/estudiantes/:id/upload', upload.single('imagen'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }

    const estudianteId = req.params.id;
    const stream = gfs.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });

    stream.end(req.file.buffer);
    stream.on('finish', async () => {
      await Estudiante.findByIdAndUpdate(estudianteId, { imagen: stream.id });
      res.json({ message: 'Imagen subida exitosamente', fileId: stream.id });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

// Ruta para obtener la imagen del estudiante
router.get('/images/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    if (!gfs) return res.status(500).json({ error: 'GridFS no inicializado' });

    const file = await conn.db.collection('uploads.files').findOne({ _id: new ObjectId(fileId) });
    if (!file) return res.status(404).json({ error: 'Archivo no encontrado' });

    res.set('Content-Type', file.contentType);
    const readStream = gfs.openDownloadStream(file._id);
    readStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la imagen' });
  }
});

// Ruta para actualizar el estado de admisión de un estudiante
router.put('/estudiantes/:id/estado', async (req, res) => {
  try {
    const { estadoAdmision } = req.body;
    if (!["En espera", "Aceptado"].includes(estadoAdmision)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const estudiante = await Estudiante.findByIdAndUpdate(
      req.params.id,
      { estadoAdmision },
      { new: true }
    );

    if (!estudiante) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }

    res.json(estudiante);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el estado de admisión" });
  }
});

export default router;
