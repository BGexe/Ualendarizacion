const express = require('express');
const { google } = require('googleapis');
const session = require('express-session');
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://ualendarizacion-production.up.railway.app'], // cambia esto según tu frontend real
  credentials: true
}));

app.use(session({
  secret: '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',
  resave: false,
  saveUninitialized: true
}));

const oauth2Client = new google.auth.OAuth2(
  '183817969866-t7v99abmqbi7pf9n28ak7201sii2jme6.apps.googleusercontent.com',
  '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',
  'https://ualendarizacion-production.up.railway.app/auth/google/callback'
);

app.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly']
  });
  res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  req.session.tokens = tokens;

  res.send('Autenticación exitosa. Ahora puedes acceder a tu calendario.');
});

app.get('/api/calendar/events', async (req, res) => {
  if (!req.session.tokens) {
    return res.status(401).send('No estás autenticado.');
  }

  oauth2Client.setCredentials(req.session.tokens);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    res.json(response.data.items);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener eventos');
  }
});

// Ruta para enviar correos
app.post('/send-email', async (req, res) => {
  const { to_email, subject, message } = req.body;

  if (!to_email || !subject || !message) {
    return res.status(400).json({ error: "Faltan datos en la solicitud" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_ADDRESS,
      to: to_email,
      subject: subject,
      text: message
    });

    res.status(200).json({ message: `Correo enviado a ${to_email}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
