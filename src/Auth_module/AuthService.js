// AuthService.js nos ayuda a gestionar los servicios de autenticación
import {auth, db} from '../Firebase';
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, updateProfile} from "firebase/auth";
import {setDoc, doc, collection, query, where, getDocs} from "firebase/firestore";
import {showSuccess} from '../ShowAlert';
// Función para verificar si el nombre de usuario ya existe
export const checkUsernameExists = async(username) => {
    // Crea una consulta para buscar en la colección 'users' si existe un documento con el nombre de usuario proporcionado.
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q); // Ejecuta la consulta y obtiene los resultados.
    return !querySnapshot.empty; // Retorna `true` si la consulta encuentra un documento; de lo contrario, `false`.
};
// Función para verificar si el correo existe en la base de datos
export const checkEmailExists = async (email) => {
    // Crea una consulta para buscar en la colección 'users' si existe un documento con el campo 'email' proporcionado.
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Retorna `true` si el correo ya existe en la base de datos.
};
// Función de registro
export const register = async(username, nombre, apellido, email, password) => {
    try{
        // Crea un nuevo usuario en Firebase Authentication con correo y contraseña.
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Actualiza el perfil del usuario con su nombre completo.
        await updateProfile(userCredential.user, {
            displayName: `${nombre} ${apellido}`,
        });
        const user = userCredential.user; // Obtiene los datos del usuario autenticado.
        // Envía un correo electrónico de verificación al usuario.
        await sendEmailVerification(user);
         // Muestra un mensaje de éxito indicando que se envió el correo de verificación.
        await showSuccess("Se ha enviado un correo de verificación. Por favor, verifica tu correo antes de iniciar sesión.");
        // Almacena la información del usuario en la base de datos Firestore bajo la colección 'users'.
        await setDoc(doc(db, "users", user.uid), {
            username,
            nombre,
            apellido,
            email,
            password,
            createdAt: new Date(), // Fecha de creación del registro.
        });
    }
    catch(error){
        throw new Error(error.message); // Lanza un error si algo falla.
    }
};
// Función de inicio de sesión
export const login = async(usernameOrEmail, password) => {
    try{
        let email = usernameOrEmail;
        // Si el usuario ingresó un nombre de usuario:
        if(!usernameOrEmail.includes('@')){
            // Busca en la base de datos el correo asociado al nombre de usuario.
            const q = query(collection(db, "users"), where("username", "==", usernameOrEmail));
            const querySnapshot = await getDocs(q);
            // Si se encuentra el nombre de usuario, recupera el correo asociado.
            if(!querySnapshot.empty){
                email = querySnapshot.docs[0].data().email;
            }
            else{
                // Si no se encuentra el nombre de usuario, lanza un error.
                throw new Error("El nombre de usuario y/o contraseña no son correctos.");
            }
        }
        // Inicia sesión con el correo electrónico obtenido y la contraseña.
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Verifica si el correo electrónico del usuario está confirmado.
        if(!user.emailVerified){
            throw new Error("Por favor, verifica tu correo electrónico antes de iniciar sesión.");
        }
        return user; // Retorna los datos del usuario.
    }
    catch(error){
        throw new Error(error.message); // Lanza un error si algo falla.
    }
};
// Función para enviar un correo de recuperación de contraseña
export const resetPassword = async (email) => {
    try{
        // Envía un correo electrónico para restablecer la contraseña al correo proporcionado.
        await sendPasswordResetEmail(auth, email);
    }
    catch(error){
        throw new Error(error.message); // Lanza un error si algo falla.
    }
};