// Profile.js es la interfaz principal de un usuaio que inició sesión
import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {auth} from '../Firebase';
import {signOut} from 'firebase/auth';
import {getUserData} from "./UserService";
import { showError } from '../ShowAlert';
import "../style.css"

const applyUserStyle = (color) => {
    document.body.style.background = `linear-gradient(to bottom, ${color} 40%, #ffffff 40%)`;
    document.documentElement.style.setProperty('--hover-color', color);
};

const Profile = () => {
    const[user, setUser] = useState(null);
    const[headerColor, setHeaderColor] = useState("#54a3ff"); // Color por defecto azul
    const navigate = useNavigate();
    // Efecto para obtener el usuario actual
    useEffect(() => {
        const currentUser = auth.currentUser; // Obtén el usuario actual desde Firebase
        const fetchUserData = async () => {
            try {
                const userData = await getUserData(currentUser.uid);
                const userColor = userData?.headerColor || "#54a3ff";
                setHeaderColor(userColor);
                applyUserStyle(userColor);
                localStorage.setItem('headerColor', userColor);
            } catch (error) {
                console.error("Error al obtener datos del usuario:", error);
            }
        };
        if (currentUser) {
            setUser(currentUser);
            const savedColor = localStorage.getItem('headerColor');
            if (savedColor) {
                setHeaderColor(savedColor);
                applyUserStyle(savedColor);
            } else {
                fetchUserData();
            }
        } else {
            navigate("/");
        }
    }, [navigate]);
    // Función para cerrar sesión
    const handleSignOut = async() => {
        try{
            await signOut(auth); // Cierra sesión
            localStorage.removeItem('headerColor'); // Limpiar el color del localStorage al cerrar sesión
            navigate('/'); // Redirige al login después de cerrar sesión
        }
        catch(error){
            showError("Error al cerrar sesión: " + error.message);
        }
    };

    return(
        <div className="profile-container">
            {user ? (
                <>
                    {/* Rectángulo superior */}
                    <div className="header-rectangle" style={{ backgroundColor: headerColor }}>
                        <div>
                            <button onClick={handleSignOut} className="signout-btn">
                                <span className="material-icons">logout</span>
                            </button>
                        </div>
                        {/* Cuadrado gris */}
                        <div className="profile-picture">
                            <p className="user-name">{user.displayName}</p>
                        </div>
                        {/* Botones en la parte inferior del header */}
                        <div className="header-buttons">
                            <button
                                className="header-button"
                                onClick={() => navigate("/edit-profile")}
                            >
                                <span className="material-icons">edit</span>
                                Editar Perfil
                            </button>
                            <button
                                className="header-button"
                                onClick={() => navigate("/create-public-group")}
                            >
                                <span className="material-icons">add</span>
                                Crear Grupo Público
                            </button>
                            <button
                                className="header-button"
                                onClick={() => navigate("/create-private-group")}
                            >
                                <span className="material-icons">add</span>
                                Crear Grupo Privado
                            </button>
                        </div>
                    </div>
                    {/* Contenedor principal debajo del rectángulo */}
                </>
            ) : (
                <p>Cargando perfil...</p>
            )}
        </div>
    );
};

export default Profile;