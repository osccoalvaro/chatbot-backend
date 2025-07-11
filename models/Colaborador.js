// models/Colaborador.js
import mongoose from 'mongoose';

const colaboradorSchema = new mongoose.Schema({
  dni: { type: String },
  nombre: { type: String, required: true },
  apellidoPaterno: { type: String, required: true },
  apellidoMaterno: { type: String, required: true },
  correo: { type: String },
  telefono: { type: String },
  fecha: { type: Date, required: true },
  usuario: { type: String, required: true },
  contrasenia: { type: String, required: true }, // En un futuro, debes encriptarla
  rol: { type: String, required: true },
}, { collection: 'colaboradores' });

export const Colaborador = mongoose.model('Colaborador', colaboradorSchema);
