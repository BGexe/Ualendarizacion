// UserService.js ayuda a acceder a los datos del usuario
import {doc, updateDoc, getDoc} from "firebase/firestore";
import {db} from '../Firebase';

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

export const updateUserProfile = async(uid, newNombre, newApellido, photoBase64, extraFields = {}) => {
    try{
        const userRef = doc(db, "users", uid);
        const updatedFields = await getUserData(uid);
        if(extraFields) Object.assign(updatedFields, extraFields);
        if(newNombre) updatedFields.nombre = newNombre;
        if(newApellido) updatedFields.apellido = newApellido;
        if(photoBase64) updatedFields.photoBase64 = photoBase64;
        if(Object.keys(updatedFields).length > 0){
            await updateDoc(userRef, updatedFields);
        }
        return;
    }
    catch(error){
        throw new Error(`Error al actualizar los datos: ${error.message}`);
    }
  };