// Login.js es la interfaz encargada del inicio de sesión
import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {login} from './AuthService';
import { showError } from '../ShowAlert';
import '../style.css';
// Componente funcional para gestionar el inicio de sesión.
const Login = () => {
    // Estados locales para manejar los datos ingresados por el usuario.
    const[usernameOrEmail, setUsernameOrEmail] = useState('');
    const[password, setPassword] = useState('');
    const[isPasswordVisible, setIsPasswordVisible] = useState(false);
    const navigate = useNavigate();
    // Establecer el color de fondo al cargar la página y no permitir el scroll
    useEffect(() => {
        document.body.style.background = `linear-gradient(to bottom, #54a3ff 40%, #ffffff 40%)`; // Establece el color azul de fondo
        // Deshabilitar scroll
        document.body.style.overflow = "hidden";
        // Restaurar scroll al desmontar el componente
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);
    // Maneja el evento de envío del formulario.
    const handleSubmit = async(e) => {
        e.preventDefault(); // Evita el comportamiento predeterminado del formulario (recargar la página).
        try{
            // Intenta autenticar al usuario con los datos proporcionados.
            await login(usernameOrEmail, password);
            navigate('/Profile'); // Si la autenticación es exitosa, redirige al perfil del usuario.
        }
        catch(error){
            // Muestra un mensaje de error si ocurre algún problema en el proceso de inicio de sesión.
            await showError(error.message);
        }
    };
    return(
        // Contenedor principal del formulario de inicio de sesión.
        <div className='login-container container'>
            {/* Muestra el icono del perfil. */}
            <img src="/images/profile.png" alt="Logo" className="login-logo"/>
            {/* Formulario para ingresar datos de inicio de sesión. */}
            <form onSubmit={handleSubmit} class="input-wrapper">
                {/* Campo para ingresar el nombre de usuario o correo electrónico. */}
                <input
                    type="text"
                    placeholder="Nombre de usuario o correo electrónico"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                />
                {/* Campo para ingresar la contraseña con opción de mostrar u ocultar el texto. */}
                <div className="password-container">
                    <input
                        type={isPasswordVisible ? 'text' : 'password'}
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {/* Botón para alternar la visibilidad de la contraseña. */}
                    <span className="toggle-password" onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
                        <i className={isPasswordVisible ? 'fas fa-eye-slash' : 'fas fa-eye'}/>
                    </span>
                </div>
                {/* Botón para enviar el formulario y autenticar al usuario. */}
                <button type="submit" className='submit'>Iniciar Sesión</button>
            </form>
            {/* Enlace para redirigir al formulario de recuperación de contraseña. */}
            <p>
                <center>
                    <span className="button-link" onClick={() => navigate('/ResetPassword')}>¿Olvidé mi contraseña?</span>
                </center>
            </p>
            {/* Enlace para redirigir al formulario de registro si el usuario no tiene cuenta. */}
            <p>
                <center>
                    ¿Aún no tienes una cuenta?{' '}
                    <span className="button-link" onClick={() => navigate('/Register')}>Registrarse</span>
                </center>
            </p>
        </div>
    );
};

export default Login;