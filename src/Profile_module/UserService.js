import {doc, updateDoc, getDoc} from "firebase/firestore";
import {updateProfile} from "firebase/auth";
import {db, auth} from '../Firebase'; // Asegúrate de que este sea tu archivo Firebase

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
export const updateUserProfile = async(uid, newNombre, newApellido, extraFields = {}) => {
    try{
        const userRef = doc(db, "users", uid);
        const updatedFields = {...extraFields}; // Agrega campos adicionales si existen
        if(newNombre) updatedFields.nombre = newNombre;
        if(newApellido) updatedFields.apellido = newApellido;
        if(Object.keys(updatedFields).length > 0) {
            await updateDoc(userRef, updatedFields);
        }
        const user = auth.currentUser;
        if(newNombre || newApellido){
            await updateProfile(user, {
                displayName: `${newNombre || user.displayName?.split(" ")[0]} ${newApellido || user.displayName?.split(" ")[1]}`,
            });
        }
        return "Datos actualizados correctamente.";
    }
    catch(error){
        throw new Error(`Error al actualizar los datos: ${error.message}`);
    }
  };