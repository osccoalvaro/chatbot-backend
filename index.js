import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { ObjectId } from 'mongodb'; // Para manejar IDs de MongoDB
import multer from 'multer'; // Importar multer para la carga de archivos
import apoderadoRoutes from './routes/apoderados.js';

dotenv.config();
const app = express();

// Configurar middlewares
app.use(cors()); // Permite solicitudes desde diferentes orígenes
app.use(express.json()); // Middleware para parsear JSON

// Configurar multer para manejar las imágenes
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Inicializar la variable gfs fuera de la conexión
let gfs;

// Conectar a MongoDB y luego iniciar el servidor
mongoose
  .connect('mongodb://0.0.0.0:27017/test')
  .then(() => {
    console.log('Conectado a MongoDB');

    // Inicializar GridFSBucket después de conectar a MongoDB
    const conn = mongoose.connection;
    console.log('Conexión a MongoDB abierta');

    // Crear un bucket de GridFS
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'uploads' // Nombre del bucket donde se almacenan los archivos
    });
    console.log('GridFSBucket inicializado');

    // Configurar las rutas después de que la conexión sea exitosa
    app.use('/api', apoderadoRoutes); // Prefijo /api para las rutas de apoderados

    // Endpoint para servir imágenes desde GridFS
    app.get('/api/images/:id', async (req, res) => {
      try {
        const fileId = req.params.id;

        if (!gfs) {
          return res.status(500).json({ error: 'GridFS no está inicializado' });
        }

        // Buscar archivo en GridFS usando el fileId
        const file = await conn.db.collection('uploads.files').findOne({ _id: new ObjectId(fileId) });
        console.log('Archivo encontrado:', file); // Debug

        if (!file) {
          return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        if (!file.contentType || !file.contentType.startsWith('image')) {
          return res.status(400).json({ error: 'El archivo no es una imagen o falta el tipo de contenido' });
        }

        // Crear stream para enviar la imagen usando GridFSBucket
        const readStream = gfs.openDownloadStream(file._id);
        res.set('Content-Type', file.contentType);
        readStream.pipe(res);
      } catch (error) {
        console.error('Error al obtener la imagen:', error);
        res.status(500).json({ error: 'Error al obtener la imagen' });
      }
    });

    // Ruta base de prueba
    app.get('/', (req, res) => {
      res.send('¡El backend está funcionando correctamente!');
    });

    // Configurar el puerto y levantar el servidor
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error al conectar a MongoDB:', error);
  });
