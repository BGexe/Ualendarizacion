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

export const sendEventInvitationEmails = async (eventId, groupId, eventDetails) => {
    try {
        // Obtener el grupo de Firestore
        const groupRef = doc(db, "GrupoPublico", groupId);
        let groupSnap = await getDoc(groupRef);

        if (!groupSnap.exists()) {
            // Si no está en GrupoPublico, buscar en GrupoPrivado
            const privateGroupRef = doc(db, "GrupoPrivado", groupId);
            groupSnap = await getDoc(privateGroupRef);
            if (!groupSnap.exists()) {
                throw new Error("No se encontró el grupo.");
            }
        }

        const groupData = groupSnap.data();
        const userUids = groupData.Usuarios || [];

        if (userUids.length === 0) {
            console.log("No hay usuarios en el grupo.");
            return;
        }

        // Obtener correos electrónicos de los usuarios en la colección users
        const usersQuery = query(collection(db, "users"), where("__name__", "in", userUids));
        const usersSnap = await getDocs(usersQuery);
        const emails = usersSnap.docs.map(doc => doc.data().email).filter(email => email);

        if (emails.length === 0) {
            console.log("No se encontraron correos de los usuarios.");
            return;
        }

        // Construir el enlace para agregar el evento a Google Calendar
        const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.summary)}&details=${encodeURIComponent(eventDetails.description)}&dates=${eventDetails.start.dateTime.replace(/[-:]/g, "").slice(0, -1)}/${eventDetails.end.dateTime.replace(/[-:]/g, "").slice(0, -1)}`;

        // Enviar correos con el enlace
        for (const email of emails) {
            await sendEmail(email, googleCalendarLink);
        }

        console.log("Correos enviados exitosamente.");
    } catch (error) {
        console.error("Error al enviar invitaciones por correo:", error);
    }
};

// Simulación de envío de correo (deberás usar una API real como SendGrid, Nodemailer, Firebase Functions, etc.)
const sendEmail = async (recipientEmail, eventLink) => {
    console.log(`📧 Enviando correo a: ${recipientEmail}`);
    console.log(`🔗 Link del evento: ${eventLink}`);
    // Aquí iría la lógica real para enviar el correo
};