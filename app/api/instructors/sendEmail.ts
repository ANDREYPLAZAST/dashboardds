import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

// Verificar variables de entorno requeridas (solo credenciales)
const requiredEnvVars = ['SMTP_USER', 'SMTP_PASS'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.warn('⚠️ Faltan variables de entorno para el servicio de correo:', missingEnvVars);
}

// Crear el transporter con configuración de FastMail
export const transporter = nodemailer.createTransport({
  host: 'smtp.fastmail.com',
  port: 587,
  secure: false, // false for port 587, true for port 465
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verificar la conexión al iniciar
transporter.verify(function (error: Error | null) {
  if (error) {
    console.error('❌ Error en la configuración del servicio de correo:', error);
  }
});

// Función auxiliar para enviar correos con mejor manejo de errores
export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    const mailOptions = {
      from: `"Affordable Driving Traffic School" <${process.env.SMTP_USER}>`,
      ...options
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    throw error;
  }
}; 