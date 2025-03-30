// UserService.js ayuda a acceder a los datos del usuario
import {doc, updateDoc, getDoc} from "firebase/firestore";
import {db} from '../Firebase'; // Asegúrate de que este sea tu archivo Firebase
// Funcion para tomar los datos del usuario
export const getUserData = async(uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
        return docSnap.data();
    }
    else{
        throw new Error("No se encontraron datos para este usuario.");
    }
};
// Función para actualizar el perfil del usuario
export const updateUserProfile = async(uid, newNombre, newApellido, photoBase64, extraFields = {}) => {
    try{
        const userRef = doc(db, "users", uid);
        const updatedFields = await getUserData(uid); // Recupera los datos actuales
        if(extraFields) Object.assign(updatedFields, extraFields); // Agrega los campos adicionales
        if(newNombre) updatedFields.nombre = newNombre;
        if(newApellido) updatedFields.apellido = newApellido;
        if(photoBase64) updatedFields.photoBase64 = photoBase64;
        if(Object.keys(updatedFields).length > 0){
            await updateDoc(userRef, updatedFields);
        }
        return "Datos actualizados correctamente.";
    }
    catch(error){
        throw new Error(`Error al actualizar los datos: ${error.message}`);
    }
  };