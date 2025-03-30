import { gapi } from "gapi-script";
import { db } from "../Firebase";
//import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../Firebase"; // Asegúrate de importar tu configuración de Firebase

const firestore = getFirestore(app); // Inicializar Firestore

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

//export const sendEventInvitationEmails = async (groupId, eventId, eventDetails) => {

    export const sendEventInvitationEmails = async (eventId, groupId, eventDetails) => {
        try {
            if (!eventDetails.userIds || eventDetails.userIds.length === 0) {
                console.error("❌ Error: La lista de usuarios está vacía.");
                return;
            }
    
            // Obtener correos de usuarios desde Firestore
            const usersQuery = query(
                collection(firestore, "users"),
                where("uid", "in", eventDetails.userIds)
            );
    
            const usersSnapshot = await getDocs(usersQuery);
            
            if (usersSnapshot.empty) {
                console.error("❌ No se encontraron usuarios con los IDs proporcionados.");
                return;
            }
    
            const emails = usersSnapshot.docs.map(doc => doc.data().email);
            console.log("📩 Correos a enviar:", emails);
    
            const response = await fetch("https://ualendarizacion-production.up.railway.app/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emails,
                    eventName: eventDetails.summary,
                    eventDate: eventDetails.start.dateTime.split("T")[0],
                    eventTime: eventDetails.start.dateTime.split("T")[1],
                    eventDescription: eventDetails.description,
                }),
                mode: 'no-cors',
            });
    
            if (!response.ok) {
                // Si la respuesta no es 200, lanzamos un error
                const errorText = await response.text();
                throw new Error(`Error al enviar el correo: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log("✅ Correos enviados:", data);
    
        } catch (error) {
            console.error("❌ Error al enviar correos:", error);
        }
    };