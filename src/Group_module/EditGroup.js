import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {updateGroupDetails} from "./GroupService";
import {showError, showSuccess} from "../ShowAlert";
import "../style.css";

const EditGroup = () => {
    const [headerColor, setHeaderColor] = useState("#54a3ff");
    const [nombre_uea, setNombreUea] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const navigate = useNavigate();

    const availableColors = [
        { value: "#930142", label: "Rojo" },
        { value: "#d53e4f", label: "Coral" },
        { value: "#f46d43", label: "Naranja" },
        { value: "#fdae61", label: "Naranja-claro" },
        { value: "#fee08b", label: "Amarillo" },
        { value: "#ffffbf", label: "Amarillo-claro" },
        { value: "#e6f598", label: "Verde-limon" },
        { value: "#abdda4", label: "Verde-claro" },
        { value: "#66c2a5", label: "Verde" },
        { value: "#3288bd", label: "Azul" },
        { value: "#5e4fa2", label: "Morado" },
    ];

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

    const updateHeaderColor = (color) => {
        document.body.style.background = `linear-gradient(to bottom, ${color} 40%, #ffffff 40%)`;
        setHeaderColor(color);
    };

    const handleUpdate = async () => {
        const storedGroup = JSON.parse(localStorage.getItem("selectedGroup"));
        if(!storedGroup || !storedGroup.id){
            showError("No se encontraron datos del grupo en localStorage.");
            return;
        }
        const updatedDetails = {};
        if(nombre_uea?.trim() && nombre_uea !== storedGroup.nombre_uea){
            updatedDetails.nombre_uea = nombre_uea;
        }
        if(descripcion?.trim() && descripcion !== storedGroup.descripcion){
            updatedDetails.descripcion = descripcion;
        }
        if(headerColor && headerColor !== storedGroup.headerColor){
            updatedDetails.headerColor = headerColor;
        }
        if(Object.keys(updatedDetails).length === 0){
            showError("No hay cambios para guardar.");
            return;
        }
    
        try{
            //console.log("Actualizando con datos:", storedGroup.id, updatedDetails);
            await updateGroupDetails(storedGroup.id, updatedDetails);
            showSuccess("Se guardaron los cambios al grupo.");
            const updatedGroup = { ...storedGroup, ...updatedDetails };
            localStorage.setItem("selectedGroup", JSON.stringify(updatedGroup));
            navigate(`/Group/${storedGroup.id}`);
        }
        catch(error){
            console.error("Error al actualizar el grupo:", error.message);
            showError("Error al actualizar el grupo. Intenta nuevamente.");
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
            >X</button>
            <img src="/images/group.png" alt="Logo" className="icon"/>
            <div className="color-selector">
                <div className="color-buttons">
                    {availableColors.map((colorOption) => (
                        <button
                            key={colorOption.value}
                            className={`color-button ${
                                headerColor === colorOption.value ? "selected" : ""
                            }`}
                            style={{ backgroundColor: colorOption.value }}
                            onClick={() => updateHeaderColor(colorOption.value)}
                            title={colorOption.label}
                        />
                    ))}
                </div>
            </div>
            <div className="input-wrapper">
                <input
                    type="text"
                    placeholder="Nuevo nombre del grupo"
                    value={nombre_uea}
                    onChange={(e) => setNombreUea(e.target.value)}
                />
                <textarea
                    placeholder="Nueva descripción del grupo"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                />
            </div>
            <button onClick={handleUpdate} type="submit" className="submit">
                Guardar Cambios
            </button>
        </div>
    );
};

export default EditGroup;