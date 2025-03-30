import { useEffect } from 'react';
import { doc, getDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../Firebase'; // Ajusta la ruta según tu proyecto
import { google } from 'googleapis';
import { JSONClient } from 'google-auth-library';

// Cliente de Google Calendar API
const calendar = google.calendar('v3');

// Función para inicializar el cliente de autenticación
const initializeAuthClient = async () => {
    const credentials = require('../google-credentials.json'); // Ajusta la ruta
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    return await auth.getClient();
};

// Función para crear un evento único en Google Calendar
const createSingleEvent = async (authClient, eventDetails, userEmail) => {
    try {
        const { nombre_evento, descripcion, dia_evento, hora_evento } = eventDetails;

        // Formatear fecha y hora
        const eventDateTime = new Date(`${dia_evento}T${hora_evento}:00`);
        const endTime = new Date(eventDateTime.getTime() + 60 * 60 * 1000); // Duración de 1 hora

        await calendar.events.insert({
            auth: authClient,
            calendarId: userEmail, // Correo electrónico del usuario
            resource: {
                summary: nombre_evento,
                description: descripcion,
                start: {
                    dateTime: eventDateTime.toISOString(),
                    timeZone: 'America/Mexico_City', // Ajusta la zona horaria según tu ubicación
                },
                end: {
                    dateTime: endTime.toISOString(),
                    timeZone: 'America/Mexico_City',
                },
                reminders: {
                    useDefault: true, // Usa recordatorios predeterminados (15 minutos)
                },
            },
        });
        console.log(`Evento único creado: ${nombre_evento}`);
    } catch (error) {
        console.error('Error al crear el evento único:', error);
    }
};

// Función para crear un evento semanal en Google Calendar
const createWeeklyEvent = async (authClient, eventDetails, userEmail) => {
    try {
        const { nombre_evento, descripcion, aula, lunes, martes, miercoles, jueves, viernes, sabado, domingo } = eventDetails;

        // Crear eventos para cada día de la semana
        const daysOfWeek = { lunes, martes, miercoles, jueves, viernes, sabado, domingo };
        for (const [day, time] of Object.entries(daysOfWeek)) {
            if (time) {
                const dayNumber = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'].indexOf(day);
                const eventDateTime = new Date();
                eventDateTime.setHours(Number(time.split(':')[0]), Number(time.split(':')[1]), 0);
                const endTime = new Date(eventDateTime.getTime() + 60 * 60 * 1000); // Duración de 1 hora

                await calendar.events.insert({
                    auth: authClient,
                    calendarId: userEmail,
                    resource: {
                        summary: `${nombre_evento} (${day})`,
                        description: `${descripcion} - Aula: ${aula}`,
                        start: {
                            dateTime: eventDateTime.toISOString(),
                            timeZone: 'America/Mexico_City',
                        },
                        end: {
                            dateTime: endTime.toISOString(),
                            timeZone: 'America/Mexico_City',
                        },
                        recurrence: [`RRULE:FREQ=WEEKLY;BYDAY=${day.toUpperCase().slice(0, 2)}`],
                        reminders: {
                            useDefault: true, // Usa recordatorios predeterminados (15 minutos)
                        },
                    },
                });
                console.log(`Evento semanal creado: ${nombre_evento} (${day})`);
            }
        }
    } catch (error) {
        console.error('Error al crear el evento semanal:', error);
    }
};

// Componente principal para sincronizar eventos
const SyncEventsWithGoogleCalendar = ({ userId }) => {
    useEffect(() => {
        const syncEvents = async () => {
            try {
                // Inicializar cliente de autenticación
                const authClient = await initializeAuthClient();

                // Obtener el correo electrónico del usuario desde Firestore
                const userRef = doc(db, 'users', userId);
                const userSnap = await getDoc(userRef);
                if (!userSnap.exists()) {
                    console.error('El usuario no existe.');
                    return;
                }
                const userEmail = userSnap.data().email;

                // Escuchar cambios en los eventos del usuario
                const eventsRef = collection(db, 'Evento');
                const q = query(eventsRef, where('id_grupo', '==', userId));
                onSnapshot(q, async (querySnapshot) => {
                    for (const docSnap of querySnapshot.docs) {
                        const eventData = docSnap.data();

                        // Crear evento único o semanal
                        if (eventData.es_ciclico) {
                            await createWeeklyEvent(authClient, eventData, userEmail);
                        } else {
                            await createSingleEvent(authClient, eventData, userEmail);
                        }
                    }
                });
            } catch (error) {
                console.error('Error al sincronizar eventos:', error);
            }
        };

        syncEvents();
    }, [userId]);

    return null; // Este componente no renderiza nada
};

export default SyncEventsWithGoogleCalendar;