// routes/estudiantes.js
import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { Estudiante } from '../models/Estudiante.js';
import { enviarMensajeWhatsApp } from '../services/whatsapp.js';
import { iniciarFlujoWhatsApp } from '../services/whatsapp.js';

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
    const estudiante = await Estudiante.findById(req.params.id).populate('apoderadoId');

    if (!estudiante) return res.status(404).json({ error: "Estudiante no encontrado" });

    const estadoAnterior = estudiante.estadoAdmision;
    estudiante.estadoAdmision = estadoAdmision;
    await estudiante.save();

    const telefono = estudiante.apoderadoId.telefono;
    const nombreApoderado = estudiante.apoderadoId.nombre;

    // Si cambió a 'Admitido'
    if (estadoAdmision === 'Admitido' && estadoAnterior !== 'Admitido') {
      const mensaje = `Hola *${nombreApoderado}*,\n\nNos alegra informarte que la admisión del estudiante *${estudiante.nombre} ${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}* ha sido aceptada. 🎉\n\nHemos reservado su vacante en *${estudiante.grado}*, y para confirmarla, es necesario realizar el pago de *S/200* por concepto de matrícula a nombre de *Colegio Montessori S.A.C.*`;
      
      await enviarMensajeWhatsApp(telefono, mensaje);
      // Esperar unos segundos opcionalmente (para no enviar los 2 juntos)
      await new Promise(resolve => setTimeout(resolve, 2000))
      // Iniciar el flujo para pedir el Yape
      await iniciarFlujoWhatsApp(telefono, 'TRIGGER_YAPE')
    }

    // Si cambió a 'Observado'
    if (estadoAdmision === 'Observado' && estadoAnterior !== 'Observado') {
      const mensaje = `Hola *${nombreApoderado}*,\n\nGracias por completar el formulario de admisión del estudiante *${estudiante.nombre} ${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}*.\n\nTras revisar la información enviada, hemos identificado que hay algunos puntos por aclarar para continuar con el proceso de admisión. ✍️\n\nUn asesor del colegio se pondrá en contacto contigo pronto para ayudarte y brindarte orientación personalizada.`;
  
      await enviarMensajeWhatsApp(telefono, mensaje);
    }

    res.json(estudiante);
  } catch (error) {
    console.error('Error al actualizar el estado:', error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
