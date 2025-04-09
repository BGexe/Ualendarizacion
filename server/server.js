const express = require('express');
const { google } = require('googleapis');
const session = require('express-session');
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 5001;
app.use(express.json());
app.use(cors());

app.use(session({
  secret: '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',
  resave: false,
  saveUninitialized: true
}));

const oauth2Client = new google.auth.OAuth2(
  '183817969866-t7v99abmqbi7pf9n28ak7201sii2jme6.apps.googleusercontent.com',
  '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',
  'http://localhost:3000/auth/google/callback'
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
/*
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
*/