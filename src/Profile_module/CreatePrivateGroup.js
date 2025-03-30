import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {db, auth} from "../Firebase"; // Asegúrate de que este sea tu archivo Firebase
import {doc, setDoc, updateDoc, arrayUnion} from "firebase/firestore";
import {showError, showSuccess} from "../ShowAlert";
import "../style.css";

const CreatePrivateGroup = () => {
    const [color, setColor] = useState("#54a3ff");
    const [nombreGrupo, setNombreGrupo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const navigate = useNavigate();
    const availableColors = [
        { value: "#d53e4f", label: "Coral" },
        { value: "#930142", label: "Rojo" },
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
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if(storedUser){
            document.body.style.background = `linear-gradient(to bottom, ${storedUser.headerColor || "#54a3ff"} 40%, #ffffff 40%)`;
        }
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const handleCreateGroup = async () => {
        if(!nombreGrupo || !descripcion){
            showError("Por favor, completa todos los campos obligatorios.");
            return;
        }
        try{
            const user = auth.currentUser;
            if(!user){
                showError("No se pudo obtener el usuario autenticado.");
                return;
            }

            const uid = user.uid;
            const groupId = `${uid}_${Date.now()}`;
            const newGroupData = {
                nombre_uea: nombreGrupo,
                descripcion,
                headerColor: color,
                profesor: uid,
                Usuarios: [uid],
            };
            await setDoc(doc(db, "GrupoPrivado", groupId), newGroupData);
            const userRef = doc(db, "users", uid);
            await updateDoc(userRef, {
                UsuarioGrupo: arrayUnion(groupId),
            });

            showSuccess("Grupo privado creado exitosamente.");
            navigate(`/Group/${groupId}`);
        }
        catch(error){
            showError("Error al crear el grupo: " + error.message);
        }
    };

    return(
        <div className="container">
        <button className="close-btn" onClick={() => navigate("/Profile")}>
            X
        </button>
        <img src="/images/group.png" alt="Logo" className="group" />
        <div className="color-selector">
            <div className="color-buttons">
            {availableColors.map((colorOption) => (
                <button
                key={colorOption.value}
                className={`color-button ${
                    color === colorOption.value ? "selected" : ""
                }`}
                style={{ backgroundColor: colorOption.value }}
                onClick={() => setColor(colorOption.value)}
                title={colorOption.label}
                />
            ))}
            </div>
        </div>
        <div className="input-wrapper">
            <input
            type="text"
            placeholder="Nombre del Grupo"
            value={nombreGrupo}
            onChange={(e) => setNombreGrupo(e.target.value)}
            />
            <textarea
            placeholder="Descripción del grupo"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            />
        </div>
        <button onClick={handleCreateGroup} type="submit" className="submit">
            Guardar Grupo
        </button>
        </div>
    );
};

export default CreatePrivateGroup;