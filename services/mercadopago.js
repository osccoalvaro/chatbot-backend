// services/mercadopago.js
import { MercadoPagoConfig, Preference } from "mercadopago";

// Inicializa el cliente con tu Access Token de producción
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 },
});

const preference = new Preference(mercadopago);

export const crearLinkDePago = async (estudianteId) => {
  const body = {
    items: [
      {
        title: "Colegio Montessori S.A.C. - Matrícula",
        unit_price: 200,
        quantity: 1,
        currency_id: "PEN",
      },
    ],
    back_urls: {
      success: "https://montessori.pe",
      failure: "https://tusitio.com/pago-fallido",
      pending: "https://tusitio.com/pago-pendiente",
    },
    auto_return: "approved",
    //notification_url: "https://03be-190-43-23-119.ngrok-free.app/api/pagos/webhook",
    notification_url: "https://specifics-controllers-corp-william.trycloudflare.com/api/pagos/webhook",  
    metadata: {
      estudianteId,
    },
  };
  try {
    const response = await preference.create({ body });
    return response.init_point; // Esto es el link de pago
  } catch (error) {
    console.error("Error al crear preferencia de Mercado Pago:", error);
    throw new Error("No se pudo generar el link de pago");
  }
};
