import { gapi } from "gapi-script";
import { db } from "../Firebase";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

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

export const sendEmailsForEvent = async (groupId, eventId, eventDetails) => {
    try {
        // Obtener correos de usuarios desde Firestore
        const usersSnapshot = await firestore.collection("users")
            .where("uid", "in", eventDetails.userIds)
            .get();

        const emails = usersSnapshot.docs.map(doc => doc.data().email);

        const response = await fetch("https://ualendarizacion-production.up.railway.app/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                emails,
                eventName: eventDetails.summary,
                eventDate: eventDetails.start.dateTime.split("T")[0],
                eventTime: eventDetails.start.dateTime.split("T")[1],
                eventDescription: eventDetails.description,
            }),
        });

        const data = await response.json();
        console.log("Correos enviados:", data);

    } catch (error) {
        console.error("Error al enviar correos:", error);
    }
};