import { Colaborador } from '../models/Colaborador.js';

export const login = async (req, res) => {
  const { usuario, contrasenia } = req.body;

  try {
    const user = await Colaborador.findOne({ usuario });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.contrasenia !== contrasenia) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Puedes agregar JWT más adelante
    return res.json({
      message: 'Login exitoso',
      user: {
        nombre: user.nombre,
        usuario: user.usuario,
        apellidoPaterno: user.apellidoPaterno,
        apellidoMaterno: user.apellidoMaterno,
        correo: user.correo,
        rol: user.rol,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error del servidor', error });
  }
};
