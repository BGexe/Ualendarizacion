import {doc, updateDoc, getDoc} from "firebase/firestore";
import {db} from "../Firebase";

export const getGroupData = async (groupId) => {
    try{
        let groupRef = doc(db, "GrupoPublico", groupId);
        let docSnap = await getDoc(groupRef);
        if(!docSnap.exists()){
            groupRef = doc(db, "GrupoPrivado", groupId);
            docSnap = await getDoc(groupRef);
            if(!docSnap.exists()){
                throw new Error("El grupo no existe en ninguna colección.");
            }
        }
        return{ id: groupId, ...docSnap.data(), collection: docSnap.ref.parent.id }; // Indica la colección de origen
    }
    catch(error){
        console.error("Error al obtener datos del grupo en Firestore:", error);
        throw error;
    }
};

export const updateGroupDetails = async (groupId, details) => {
    try{
        const groupData = await getGroupData(groupId);
        const collectionName = groupData.collection;

        if(!collectionName) throw new Error("No se encontró el grupo en ninguna colección.");

        const groupRef = doc(db, collectionName, groupId);
        await updateDoc(groupRef, details);

        //console.log(`Grupo ${groupId} actualizado en ${collectionName} con`, details);
    }
    catch(error){
        console.error("Error al actualizar el grupo:", error);
        throw error;
    }
};