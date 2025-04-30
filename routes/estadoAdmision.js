// Ruta en tu backend Node.js
/*import { Router } from 'express'
const router = Router()

router.put('/api/estudiantes/:id/estado', async (req, res) => {
  const { id } = req.params
  const { nuevoEstado } = req.body

  try {
    const estudiante = await Estudiante.findById(id).populate('apoderadoId')
    if (!estudiante) return res.status(404).json({ mensaje: 'Estudiante no encontrado' })

    const estadoAnterior = estudiante.estadoAdmision
    estudiante.estadoAdmision = nuevoEstado
    await estudiante.save()

    // Si el estado cambia a 'Admitido', enviar mensaje
    if (estadoAnterior !== 'Admitido' && nuevoEstado === 'Admitido') {
      const telefono = estudiante.apoderadoId.telefono

      // Enviar mensaje usando tu instancia del bot (ver siguiente paso)
      await enviarMensajeWhatsApp(telefono, `📢 Estimado apoderado, la admisión del estudiante *${estudiante.nombre} ${estudiante.apellidoPaterno}* ha sido *aceptada*. 🎉`)
    }

    res.json({ mensaje: 'Estado actualizado correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ mensaje: 'Error al actualizar estado' })
  }
})

export default router*/
