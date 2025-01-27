// models/Apoderado.js
import mongoose from 'mongoose';

const apoderadoSchema = new mongoose.Schema({
  dni: { type: String, required: true },
  nombre: { type: String, required: true },
  apellidoPaterno: { type: String, required: true },
  apellidoMaterno: { type: String, required: true },
  correo: { type: String, required: true },
  telefono: { type: String, required: true },
  fecha: { type: Date, required: true },
  imagen: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID de GridFS
});

export const Apoderado = mongoose.model('Apoderado', apoderadoSchema);
