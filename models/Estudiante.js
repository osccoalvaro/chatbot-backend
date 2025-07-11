// models/Estudiante.js
import mongoose from 'mongoose';

const estudianteSchema = new mongoose.Schema({
  dni: { type: String, required: true },
  nombre: { type: String, required: true },
  apellidoPaterno: { type: String, required: true },
  apellidoMaterno: { type: String, required: true },
  tipoAdmision: { type: String },
  grado: { type: String, required: true },
  condicionMedica: { type: String }, 
  imagen: { type: mongoose.Schema.Types.ObjectId }, // ID de GridFS
  imagenLibreta: { type: mongoose.Schema.Types.ObjectId }, // Imagen de la Libreta en GridFS
  estadoAdmision: { type: String, enum: ["Pendiente", "Admitido", "Observado"], default: "Pendiente" },
  apoderadoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Apoderado', required: true },
  pagoMatricula: { type: Boolean, default: false }
});

export  const Estudiante = mongoose.model('Estudiante', estudianteSchema);
