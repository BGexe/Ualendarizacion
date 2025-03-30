import {doc, updateDoc, getDoc} from "firebase/firestore";
import {db} from "../Firebase"; // Importa db correctamente

export const getGroupData = async (groupId) => {
    try{
        // Primero busca en GrupoPublico
        let groupRef = doc(db, "GrupoPublico", groupId);
        let docSnap = await getDoc(groupRef);
        if(!docSnap.exists()){
            // Si no existe en GrupoPublico, busca en GrupoPrivado
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
        // Buscar el grupo para saber en qué colección está
        const groupData = await getGroupData(groupId);
        const collectionName = groupData.collection; // Saber si está en GrupoPublico o GrupoPrivado

        if(!collectionName) throw new Error("No se encontró el grupo en ninguna colección.");

        // Referencia al grupo correcto
        const groupRef = doc(db, collectionName, groupId);
        await updateDoc(groupRef, details);

        console.log(`Grupo ${groupId} actualizado en ${collectionName} con`, details);
    }
    catch(error){
        console.error("Error al actualizar el grupo:", error);
        throw error;
    }
};