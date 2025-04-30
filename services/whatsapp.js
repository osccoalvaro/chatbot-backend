// services/whatsapp.js
import { createProvider } from '@builderbot/bot';
import { MetaProvider as Provider } from '@builderbot/provider-meta'
import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config();

/*
const provider = createProvider(Provider, {
  jwtToken: process.env.JWTOKEN,
  numberId: process.env.META_NUMBER_ID,
  verifyToken: process.env.VERIFY_TOKEN,
  version: 'v18.0',
});
*/

export const enviarMensajeWhatsApp = async (telefono, mensaje) => {
    try {
      await axios.post(`${process.env.BOT_URL}/v1/messages`, {
        number: telefono,
        message: mensaje
      })
      console.log('Mensaje enviado a WhatsApp:', telefono)
    } catch (error) {
      console.error('Error al enviar mensaje por WhatsApp:', error?.response?.data || error.message)
    }
  }

  export const iniciarFlujoWhatsApp = async (telefono, flow) => {
    try {
      await axios.post(`${process.env.BOT_URL}/v1/start-flow`, {
        number: telefono,
        flow: flow // Por ejemplo: 'flowYape'
      })
      console.log('Flow iniciado en WhatsApp:', flow)
    } catch (error) {
      console.error('Error al iniciar flow en WhatsApp:', error?.response?.data || error.message)
    }
  }  