// Register.js es la interfaz encargada del formulario de registro
import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {register, checkUsernameExists} from './AuthService';
import {showError} from '../ShowAlert';
import '../style.css';
// Componente funcional para gestionar el formulario de registro.
const Register = () => {
    const [isHovered, setIsHovered] = useState(false);
    // Estados locales para manejar los datos ingresados por el usuario.
    const[username, setUsername] = useState('');
    const[nombre, setNombre] = useState('');
    const[apellido, setApellido] = useState('');
    const[email, setEmail] = useState('');
    const[password, setPassword] = useState('');
    const[confirmPassword, setConfirmPassword] = useState('');
    const[isPasswordVisible, setIsPasswordVisible] = useState(false);
    const[isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
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
        // Verificación de campos obligatorios.
        if(!nombre || !apellido || !username || !email || !password || !confirmPassword){
            const missingFields = [];
            if(!username) missingFields.push('Nombre de usuario');
            if(!nombre) missingFields.push('Nombre');
            if(!apellido) missingFields.push('Apellido');
            if(!email) missingFields.push('Correo electrónico');
            if(!password) missingFields.push('Contraseña');
            if(!confirmPassword) missingFields.push('Confirmación de contraseña');
            // Si hay campos faltantes, muestra una alerta con los campos que deben completarse.
            if(missingFields.length > 0){
                await showError(`Por favor, completa los siguientes campos: ${missingFields.join(', ')}`);
                return;
            }
        }
        // Verifica si las contraseñas coinciden.
        if(password !== confirmPassword){
            await showError("Las contraseñas no coinciden.");
            return;
        }
        // Verifica si el nombre de usuario ya está registrado.
        const usernameExists = await checkUsernameExists(username);
        if(usernameExists){
            await showError("El nombre de usuario ya está en uso.");
            return;
        }
        try{
            await register(username, nombre, apellido, email, password); // Pasa la foto como argumento
            navigate('/'); // Redirige al usuario a la página de inicio de sesión tras registrarse exitosamente.
        }
        catch(error){
            // Muestra un mensaje de error si ocurre un problema durante el registro.
            await showError(error.message);
        }
    };
    return(
        // Contenedor principal del formulario de registro.
        <div className='register-container container'>
            <form onSubmit={handleSubmit} className="input-wrapper">
                {/* Campo para ingresar el nombre de usuario. */}
                <input
                    type="text"
                    placeholder="Nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                {/* Campo para ingresar el nombre personal. */}
                <input
                    type="text"
                    placeholder="Nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                />
                {/* Campo para ingresar el apellido personal. */}
                <input 
                    ype="text"
                    placeholder="Apellido"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                />
                {/* Campo para ingresar el correo electrónico. */}
                <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {/* Campo para ingresar la contraseña con opción de mostrar u ocultar el texto. */}
                <div className="password-container">
                    <input
                        type={isPasswordVisible ? 'text' : 'password'}
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <span className="toggle-password" onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
                        <i className={isPasswordVisible ? 'fas fa-eye-slash' : 'fas fa-eye'}/>
                    </span>
                </div>
                {/* Campo para confirmar la contraseña con opción de mostrar u ocultar el texto. */}
                <div className="password-container">
                    <input
                        type={isConfirmPasswordVisible ? 'text' : 'password'}
                        placeholder="Confirmar Contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <span className="toggle-password" onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                        <i className={isConfirmPasswordVisible ? 'fas fa-eye-slash' : 'fas fa-eye'}/>
                    </span>
                </div>
                {/* Botón para enviar el formulario y registrar al usuario. */}
                <button type="submit" style={{
                    backgroundColor: isHovered ? 'white' : "#47d54b",
                    color: isHovered ? '#47d54b' : "white",
                    borderColor: isHovered ? '#47d54b' : "white"
                }}
                onMouseEnter={() => setIsHovered(true)} // Activa hover
                onMouseLeave={() => setIsHovered(false)}>
                    Registrarse
                </button>
                </form>
                {/* Enlace para redirigir al formulario de inicio de sesión si ya tiene cuenta. */}
                <p>
                    ¿Ya tienes una cuenta?{' '}
                    <span className="button-link" onClick={() => navigate('/')}>Iniciar sesión</span>
                </p>
        </div>
    );
};

export default Register;