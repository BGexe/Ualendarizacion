// ResetPassword.js es la interfaz encargada del reseteo de contraseña
import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {resetPassword, checkEmailExists} from './AuthService';
import {showError, showSuccess} from '../ShowAlert';
import '../style.css';
// Componente funcional para gestionar el formulario de restablecimiento de contraseña.
const ResetPassword = () => {
    const[email, setEmail] = useState('');
    const navigate = useNavigate();
    // Función para manejar el envío del formulario de restablecimiento.
    const handleReset = async (e) => {
        e.preventDefault(); // Evita el comportamiento predeterminado del formulario (recargar la página).
        // Verifica si el campo de correo está vacío.
        if(!email){
            showError("Por favor, ingresa tu correo electrónico.");
            return;
        }
        try{
            // Verifica si el correo electrónico está registrado en la base de datos.
            const user = await checkEmailExists(email);
            if(!user){
                showError("El correo electrónico no está registrado.");
                return;
            }
            // Envía el correo para restablecer la contraseña.
            await resetPassword(email);
            await showSuccess("Te hemos enviado un correo para restablecer tu contraseña.");
            // Redirige al usuario a la página principal después de enviar el correo.
            navigate('/');
        }
        catch(error){
            // Muestra un mensaje de error si ocurre algún problema durante el proceso.
            showError("Error: " + error.message);
        }
    };
    return(
        // Contenedor principal del formulario de restablecimiento de contraseña.
        <div className='reset-password-container container'>
            {/* Muestra una imagen representativa para la página de restablecimiento de contraseña. */}
            <img src="/images/r-pw.png" alt="Logo" className="r-pw-logo"/>
            {/* Botón para cerrar o salir del formulario, redirigiendo a la página de inicio de sesión. */}
            <button onClick={() => navigate('/')} className="close-btn">X</button>
            {/* Formulario de restablecimiento de contraseña. */}
            <form onSubmit={handleReset} class="input-wrapper">
                {/* Campo para ingresar el correo electrónico. */}
                <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {/* Botón para enviar el formulario. */}
                <button type="submit">Enviar correo</button>
            </form>
        </div>
    );
};

export default ResetPassword;