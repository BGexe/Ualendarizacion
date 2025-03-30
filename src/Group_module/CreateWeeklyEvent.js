import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {db} from "../Firebase";
import {addDoc, collection} from "firebase/firestore";
import {showError, showSuccess} from "../ShowAlert";
import "../style.css";

const daysOfWeek = ["L", "M", "X", "J", "V", "S", "D"];

const fullDayNames = {
    L: "lunes",
    M: "martes",
    X: "miercoles",
    J: "jueves",
    V: "viernes",
    S: "sabado",
    D: "domingo",
};

const CreateWeeklyEvent = () => {
    const [eventName, setEventName] = useState("");
    const [classroom, setClassroom] = useState("");
    const [description, setDescription] = useState("");
    const [selectedDays, setSelectedDays] = useState({});
    const [activeDay, setActiveDay] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedGroup = JSON.parse(localStorage.getItem("selectedGroup"));
        if(storedGroup){
            document.body.style.background = `linear-gradient(to bottom, ${storedGroup.headerColor || "#54a3ff"} 40%, #ffffff 40%)`;
        }
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    // Función para manejar la selección/deselección de días
    const toggleDay = (day) => {
        setActiveDay((prevActiveDay) => {
            if(prevActiveDay === day){
                return null; // Desactivar el día si ya está activo
            }
            return day; // Activar el día seleccionado
        });
    };

    // Función para actualizar la hora de un día específico
    const handleTimeChange = (day, time) => {
        setSelectedDays((prev) => ({
            ...prev,
            [day]: { estado: prev[day]?.hora ? "assigned" : "selected", hora: time },
        }));
    };
    
    const getButtonClass = (day) => {
        if(activeDay === day){
            return "day-btn active"; // Azul si está seleccionado
        }
        if(selectedDays[day]?.hora){
            return "day-btn assigned"; // Gris si tiene una hora asignada pero no está seleccionado
        }
        return "day-btn"; // Blanco por defecto
    };

    // Función para guardar el evento en Firestore
    const handleSaveEvent = async () => {
        const storedGroup = JSON.parse(localStorage.getItem("selectedGroup"));
        if(!storedGroup || !storedGroup.id){
            showError("No se ha seleccionado un grupo.");
            return;
        }
        if(!eventName || !classroom || !description){
            showError("Por favor, complete todos los campos.");
            return;
        }
        const daysWithHours = Object.keys(selectedDays).reduce((acc, day) => {
            if(selectedDays[day]?.hora){
                acc[fullDayNames[day]] = selectedDays[day].hora;
            }
            return acc;
        }, {});

        if(Object.keys(daysWithHours).length === 0){
            showError("Por favor, asigne al menos una hora a un día de la semana.");
            return;
        }

        try{
            // Guardar el evento en Firestore
            await addDoc(collection(db, "Evento"), {
                id_grupo: storedGroup.id,
                nombre_evento: eventName,
                descripcion: description,
                es_ciclico: true,
                aula: classroom,
                ...daysWithHours,
            });
            setEventName("");
            setClassroom("");
            setDescription("");
            setSelectedDays({});
            setActiveDay(null);
            showSuccess("Evento guardado exitosamente.");
            navigate(`/Group/${storedGroup.id}`);
        }
        catch(error){
            console.error("Error al guardar el evento:", error);
            showError("Hubo un error al guardar el evento. Por favor, inténtalo de nuevo.");
        }
    };

    return(
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
                <div className="days-container">
                    {daysOfWeek.map((day, index) => (
                        <button
                            key={index}
                            className={getButtonClass(day)}
                            onClick={() => toggleDay(day)}
                        >
                            {day}
                        </button>
                    ))}
                </div>
                {/* Mostrar el campo de hora solo para el día activo */}
                {activeDay && (
                    <div>
                        <input
                            id={`time-${activeDay}`}
                            type="time"
                            value={selectedDays[activeDay]?.hora || ""}
                            onChange={(e) => handleTimeChange(activeDay, e.target.value)}
                            className="custom-font"
                        />
                    </div>
                )}
                <input
                    type="text"
                    placeholder="Aula"
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                />
                <textarea
                    placeholder="Descripción del evento"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <button type="submit" className="submit" onClick={handleSaveEvent}>
                Guardar evento
            </button>
        </div>
    );
};

export default CreateWeeklyEvent;