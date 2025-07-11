import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { ObjectId } from 'mongodb'; // Para manejar IDs de MongoDB
import multer from 'multer'; // Importar multer para la carga de archivos
import apoderadoRoutes from './routes/apoderados.js';
import colaboradorRoutes from './routes/colaboradores.js';
import estudianteRoutes from './routes/estudiantes.js';
import gradoRoutes from './routes/grados.js';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { Estudiante } from './models/Estudiante.js'; // Asegúrate de tener este modelo
import axios from 'axios'
import { enviarMensajeWhatsApp } from './services/whatsapp.js';
import authRoutes from './routes/auth.js';

dotenv.config();
const app = express();

// Configurar Mercado Pago
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});
const payment = new Payment(mercadopago);


// Configurar middlewares
app.use(cors()); // Permite solicitudes desde diferentes orígenes
app.use(express.json()); // Middleware para parsear JSON


// Ruta del webhook de pagos
app.post('/api/pagos/webhook', async (req, res) => {
  const paymentData = req.body;
  console.log("Webhook recibido:", JSON.stringify(paymentData, null, 2));

  let paymentId;

  if (paymentData.type === 'payment' && paymentData.data?.id) {
    paymentId = paymentData.data.id;
    console.log("ID recibido:", paymentId);

    try {
      const paymentResponse = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      });

      const payment = paymentResponse.data;
      console.log("Datos del pago recibidos:", JSON.stringify(payment, null, 2));

      // ✅ Verifica si metadata existe
      if (payment.metadata && payment.metadata.estudiante_id) {
        console.log("Metadata encontrada:", payment.metadata);

        // ✅ Actualizar el campo pagoMatricula del estudiante
        const estudianteId = payment.metadata.estudiante_id;

        try {
          const result = await Estudiante.findByIdAndUpdate(
            estudianteId,
            { pagoMatricula: true },
            { new: true } // devuelve el documento actualizado
          );

          if (result) {
            console.log(`✅ Estudiante actualizado: ${result.nombre} ${result.apellidoPaterno}`);

            // Obtener información del apoderado y enviar mensaje WhatsApp
            const estudianteConApoderado = await Estudiante.findById(estudianteId).populate('apoderadoId');
            const telefono = estudianteConApoderado.apoderadoId?.telefono;
            const nombreApoderado = estudianteConApoderado.apoderadoId?.nombre;

            if (telefono && nombreApoderado) {
              const mensaje = `Hola *${nombreApoderado}*,\n\nHemos recibido correctamente el pago de matrícula para *${estudianteConApoderado.nombre} ${estudianteConApoderado.apellidoPaterno} ${estudianteConApoderado.apellidoMaterno}*. ✅\n\nGracias por confiar en el *Colegio Montessori*. ¡Bienvenidos a esta nueva etapa académica! 🎉`;

              try {
                await enviarMensajeWhatsApp(telefono, mensaje);
                console.log("📲 Mensaje de confirmación de matrícula enviado por WhatsApp.");
              } catch (e) {
                console.error("❌ Error al enviar mensaje de WhatsApp:", e.message);
              }
            } else {
              console.warn("⚠️ No se encontró número de teléfono o nombre del apoderado.");
            }
          } else {
            console.warn(`❌ No se encontró estudiante con ID: ${estudianteId}`);
          }
        } catch (dbError) {
          console.error("❌ Error al actualizar el estudiante:", dbError.message);
        }
      } else {
        console.warn("❌ No se encontró metadata en la respuesta del pago.");
      }

    } catch (error) {
      console.error("Error al obtener los datos del pago:", error.response?.data || error.message);
    }
  }

  res.sendStatus(200);
});

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
    app.use('/api', estudianteRoutes);
    app.use('/api', gradoRoutes);
    app.use('/api', authRoutes);
    app.use('/api', colaboradorRoutes);

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
