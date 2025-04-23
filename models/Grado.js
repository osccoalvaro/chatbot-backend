// models/Apoderado.js
import mongoose from 'mongoose';

const gradoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  vacante: { type: Number, required: true },
  nivel: { type: String, required: true }
});

export const Grado = mongoose.model('Grado', gradoSchema);