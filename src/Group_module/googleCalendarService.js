import { gapi } from "gapi-script";

export const initializeGoogleApi = async () => {
    return new Promise((resolve, reject) => {
        gapi.load("client:auth2", async () => {
            try {
                await gapi.client.init({
                    clientId: "183817969866-t7v99abmqbi7pf9n28ak7201sii2jme6.apps.googleusercontent.com",
                    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
                        "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"
                    ],
                    scope: "https://www.googleapis.com/auth/calendar.events",
                });

                const authInstance = gapi.auth2.getAuthInstance();
                
                // 🔹 Cerrar sesión antes de autenticar al nuevo usuario
                if (authInstance.isSignedIn.get()) {
                    await authInstance.signOut();
                }

                resolve(authInstance);
            } catch (error) {
                console.error("Error al inicializar Google API:", error);
                reject(error);
            }
        });
    });
};

export const signInToGoogle = async () => {
    try {
        const authInstance = gapi.auth2.getAuthInstance();
        await authInstance.signIn();
        return authInstance.currentUser.get().getBasicProfile().getEmail(); // 🔹 Devuelve el correo del usuario autenticado
    } catch (error) {
        console.error("Error al iniciar sesión en Google:", error);
        throw error;
    }
};

export const createEventInGoogleCalendar = async (eventDetails) => {
    try {
        const token = gapi.auth.getToken()?.access_token;
        if (!token) {
            throw new Error("No se pudo obtener el token de autenticación.");
        }

        const response = await fetch(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(eventDetails),
            }
        );

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.error?.message || "Error desconocido en Google Calendar.");
        }

        return responseData;
    } catch (error) {
        console.error("Error al crear evento en Google Calendar:", error);
        throw error;
    }
};

export const createWeeklyRecurringEvent = async (eventName, description, location, days, hora, fechaInicio, fechaFin) => {
    const dayMap = {
        lunes: "MO",
        martes: "TU",
        miercoles: "WE",
        jueves: "TH",
        viernes: "FR",
        sabado: "SA",
        domingo: "SU"
    };

    const byDay = days.map(d => dayMap[d.toLowerCase()]);

    // Buscar primera fecha de inicio entre los días seleccionados
    const dayIndex = {
        domingo: 0,
        lunes: 1,
        martes: 2,
        miercoles: 3,
        jueves: 4,
        viernes: 5,
        sabado: 6
    };

    let startDate = null;
    for (const d of days) {
        const target = dayIndex[d.toLowerCase()];
        const temp = new Date(fechaInicio);
        const diff = (target - temp.getDay() + 7) % 7;
        temp.setDate(temp.getDate() + diff);
        if (!startDate || temp < startDate) {
            startDate = temp;
        }
    }

    const [h, m] = hora.split(":");
    startDate.setHours(parseInt(h));
    startDate.setMinutes(parseInt(m));

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1); // duración: 1 hora

    const event = {
        summary: eventName,
        description,
        location,
        start: {
            dateTime: startDate.toISOString(),
            timeZone: "America/Mexico_City",
        },
        end: {
            dateTime: endDate.toISOString(),
            timeZone: "America/Mexico_City",
        },
        recurrence: [
            `RRULE:FREQ=WEEKLY;BYDAY=${byDay.join(",")};UNTIL=${fechaFin.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`
        ],
    };

    const response = await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
    });

    return response.result;
};

export async function sendEmail(toEmail, subject, message) {
    try {
        const response = await fetch("http://127.0.0.1:5002/send-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                to_email: toEmail,   // Debe coincidir con la clave en Flask
                subject: subject,
                message: message
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Error desconocido");
        }
        console.log("Correo enviado con éxito:", data);
    } catch (error) {
        console.error("Error en la petición:", error);
    }
}
