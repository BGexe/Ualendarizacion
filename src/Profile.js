// Profile.js es la interfaz principal de un usuaio que inició sesión
import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {auth} from './Firebase';
import {signOut} from 'firebase/auth';

const Profile = () => {
    const[user, setUser] = useState(null);
    const navigate = useNavigate();
    // Efecto para obtener el usuario actual
    useEffect(() => {
        const fetchUserProfile = () => {
            const currentUser = auth.currentUser; // Obtén el usuario actual desde Firebase
            if(currentUser){
                setUser(currentUser);
            }
            else{
                navigate('/'); // Si no hay usuario, redirige al login
            }
        };
        fetchUserProfile();
    }, [navigate]);

    // Función para cerrar sesión
    const handleSignOut = async () => {
        try{
            await signOut(auth); // Cierra sesión
            navigate('/'); // Redirige al login después de cerrar sesión
        }
        catch(error){
            alert("Error al cerrar sesión: " + error.message);
        }
    };

    return(
        <div>
            <h2>Perfil</h2>
            {user ? (
                <center>
                    <p>Bienvenido, {user.displayName}!</p> {/* Mostrar el displayName directamente */}
                    <button onClick={handleSignOut}>Cerrar sesión</button>
                </center>
            ) : (
                <p>Cargando perfil...</p> // Mensaje de carga mientras se obtiene el usuario
            )}
        </div>
    );
};

export default Profile;