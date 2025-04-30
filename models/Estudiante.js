// models/Estudiante.js
import mongoose from 'mongoose';

const estudianteSchema = new mongoose.Schema({
  dni: { type: String, required: true },
  nombre: { type: String, required: true },
  apellidoPaterno: { type: String, required: true },
  apellidoMaterno: { type: String, required: true },
  grado: { type: String, required: true },
  imagen: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID de GridFS
  imagenLibreta: { type: mongoose.Schema.Types.ObjectId, required: true }, // Imagen de la Libreta en GridFS
  estadoAdmision: { type: String, enum: ["Pendiente", "Admitido", "Observado"], default: "Pendiente" },
  apoderadoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Apoderado', required: true }});

export const Estudiante = mongoose.model('Estudiante', estudianteSchema);
