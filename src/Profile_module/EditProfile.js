import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {updateUserProfile, getUserData} from "./UserService"; // Asegúrate de importar correctamente
import {auth} from "../Firebase";
import {showError, showSuccess} from "../ShowAlert";
import "../style.css";

const EditProfile = () => {
    const[color, setColor] = useState("#54a3ff");
    const[firstName, setFirstName] = useState("");
    const[lastName, setLastName] = useState("");
    const navigate = useNavigate();
    // Colores disponibles
    const availableColors = [
        {value: "#930142", label: "Rojo"},
        {value: "#d53e4f", label: "Coral"},
        {value: "#f46d43", label: "Naranja"},
        {value: "#fdae61", label: "Naranja-claro"},
        {value: "#fee08b", label: "Amarillo"},
        {value: "#ffffbf", label: "Amarillo-claro"},
        {value: "#e6f598", label: "Verde-limon"},
        {value: "#abdda4", label: "Verde-claro"},
        {value: "#66c2a5", label: "Verde"},
        {value: "#3288bd", label: "Azul"},
        {value: "#5e4fa2", label: "Morado"},
    ];
    // Cargar datos del usuario
    useEffect(() => {
        const fetchData = async() => {
            try{
                const userData = await getUserData(auth.currentUser?.uid);
                const userColor = userData?.headerColor;
                setColor(userData?.headerColor);
                document.body.style.background = `linear-gradient(to bottom, ${userColor} 40%, #ffffff 40%)`;
            }
            catch(error){
                showError("Error al cargar los datos del usuario:", error);
            }
        };
        fetchData();
    }, []);
    // Deshabilitar y habilitar scroll
    useEffect(() => {
        // Deshabilitar scroll
        document.body.style.overflow = "hidden";
        // Restaurar scroll al desmontar el componente
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);
    // Manejar la actualización del perfil
    const handleUpdate = async() => {
        const uid = auth.currentUser?.uid;
        if(!uid){
            showError("El usuario no está autenticado.");
            return;
        }
        try{
            await updateUserProfile(uid, firstName, lastName, { headerColor: color });
            showSuccess("Se guardaron los cambios al perfil.");
            // Guardar el nuevo color en localStorage
            localStorage.setItem('headerColor', color);
            // Actualizar el color de fondo en el body
            document.body.style.background = `linear-gradient(to bottom, ${color} 40%, #ffffff 40%)`;
            navigate("/Profile");
        }
        catch(error){
            console.error("Error al actualizar el perfil:", error.message);
            showError("Error al actualizar el perfil. Intenta nuevamente.");
        }
    };
    return(
        <div className="edit-profile-container container">
            <button
                className="close-btn"
                onClick={() => navigate("/Profile")}
            >X</button>
            <img src="/images/profile.png" alt="Logo" className="login-logo"/>
            {/* Selección de color */}
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
                    placeholder="Nuevo nombre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Nuevo apellido"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
            </div>
            <button onClick={handleUpdate} type="submit" className="submit">
                Guardar Cambios
            </button>
        </div>
    );
};

export default EditProfile;