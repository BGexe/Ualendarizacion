import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../Firebase";
import {initializeGoogleApi, signInToGoogle, createWeeklyRecurringEvent} from "./googleCalendarService";
import { showError, showSuccess } from "../ShowAlert";

const EventAuthorization = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = "#87cefa"; // negro
    // Limpiar el estilo cuando se abandone la página
    return () => {
      document.body.style.backgroundColor = ""; // restaurar el color anterior
    };
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        showError("ID de evento no válido.");
        return;
      }

      try {
        const ref = doc(db, "Evento", eventId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          throw new Error("El evento no fue encontrado.");
        }
        setEventData(snap.data());
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar evento:", error);
        showError("No se pudo cargar el evento.");
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleAuthorize = async () => {
    if (!eventData) return;

    try {
      setAuthenticating(true);
      await initializeGoogleApi();
      await signInToGoogle();

      const dias = Object.keys(eventData).filter(d =>
        ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"].includes(d)
      );

      const hora = eventData[dias[0]];

      await createWeeklyRecurringEvent(
        eventData.nombre_evento,
        eventData.descripcion,
        eventData.aula || "",
        dias,
        hora,
        eventData.inicio_trimestre.toDate(),
        eventData.fin_trimestre.toDate()
      );
      window.location.href = "https://calendar.google.com/";
    } catch (error) {
      console.error("Error al autorizar evento:", error);
      showError("No se pudo agregar el evento.");
    } finally {
      setAuthenticating(false);
    }
  };

  if (loading) return <p>Cargando evento...</p>;

  return (
    <div className="container">
        <div className="auth">
            <h2>Autorizar Evento</h2>
            <p><strong>Nombre:</strong> {eventData.nombre_evento}</p>
            <p><strong>Descripción:</strong> {eventData.descripcion}</p>
            <p><strong>Aula:</strong> {eventData.aula || "No especificado"}</p>
            <p><strong>Días:</strong> {Object.keys(eventData).filter(d => ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"].includes(d)).join(", ")}</p>
            <button onClick={handleAuthorize} disabled={authenticating}>
                {authenticating ? "Autenticando..." : "Agregar a Google Calendar"}
            </button>
        </div>
    </div>
  );
};

export default EventAuthorization;