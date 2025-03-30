import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../Firebase";
import { collection, addDoc } from "firebase/firestore";
import { showError, showSuccess } from "../ShowAlert";
import "../style.css";
import { initializeGoogleApi, signInToGoogle, createEventInGoogleCalendar, sendEventInvitationEmails } from "./googleCalendarService"; // ✅ Importar la nueva función
//import { initializeGoogleApi, signInToGoogle, createEventInGoogleCalendar } from "./googleCalendarService"; // ✅ Importar la nueva función

const CreateUniqueEvent = () => {
    const [eventName, setEventName] = useState("");
    const [description, setDescription] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [eventTime, setEventTime] = useState("");
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState("");

    useEffect(() => {
        const storedGroup = JSON.parse(localStorage.getItem("selectedGroup"));
        if (storedGroup) {
            document.body.style.background = `linear-gradient(to bottom, ${storedGroup.headerColor || "#54a3ff"} 40%, #ffffff 40%)`;
        }
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    useEffect(() => {
        const loadGoogleApi = async () => {
            try {
                await initializeGoogleApi();
                console.log("Google API inicializada correctamente.");
            } catch (error) {
                console.error("Error al cargar Google API:", error);
            }
        };
        loadGoogleApi();
    }, []);

    const handleCreateEvent = async () => {
        const selectedGroup = JSON.parse(localStorage.getItem("selectedGroup"));
        if (!selectedGroup || !selectedGroup.id) {
            showError("No se ha seleccionado un grupo.");
            return;
        }

        if (!eventName || !description || !eventDate || !eventTime) {
            showError("Por favor, complete todos los campos.");
            return;
        }

        try {
            const email = await signInToGoogle();
            setUserEmail(email);
            console.log("Usuario autenticado:", userEmail);

            const eventRef = await addDoc(collection(db, "Evento"), {
                id_grupo: selectedGroup.id,
                nombre_evento: eventName,
                descripcion: description,
                es_ciclico: false,
                dia_evento: eventDate,
                hora_evento: eventTime,
                usuario: email,
            });

            console.log("Evento creado en Firestore:", eventRef.id);

            const dateTimeStart = `${eventDate}T${eventTime}:00`;
            const dateTimeEnd = `${eventDate}T${eventTime}:00`;

            const eventDetails = {
                summary: eventName,
                description: description,
                start: {
                    dateTime: dateTimeStart,
                    timeZone: "America/Mexico_City",
                },
                end: {
                    dateTime: dateTimeEnd,
                    timeZone: "America/Mexico_City",
                },
            };

            //const createdEvent = await createEventInGoogleCalendar(eventDetails);
            await createEventInGoogleCalendar(eventDetails);
            console.log("Evento creado en Google Calendar.");
            await sendEventInvitationEmails(eventRef.id, selectedGroup.id, eventDetails);
            
            showSuccess("Evento creado en Firestore y Google Calendar.");
            setEventName("");
            setDescription("");
            setEventDate("");
            setEventTime("");
            navigate(`/Group/${selectedGroup.id}`);
        } catch (error) {
            console.error("Error al crear el evento:", error);
            console.error("Detalles del error:", JSON.stringify(error, null, 2));
            showError(`Error: ${error.message || "Hubo un error inesperado."}`);
        }
    };

    return (
        <div className="container">
            <button
                className="close-btn"
                onClick={() => {
                    const storedGroup = JSON.parse(localStorage.getItem("selectedGroup"));
                    navigate(`/Group/${storedGroup.id}`);
                }}
            >
                X
            </button>
            <img src="/images/event.png" alt="Logo" className="icon" />
            <div className="input-wrapper">
                <input
                    type="text"
                    placeholder="Nombre del evento"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                />
                <input
                    type="date"
                    placeholder="Fecha"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="custom-font"
                />
                <input
                    type="time"
                    placeholder="Hora"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                />
                <textarea
                    placeholder="Descripción"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <button className="submit-btn" onClick={handleCreateEvent}>
                    Crear Evento
                </button>
            </div>
        </div>
    );
};

export default CreateUniqueEvent;