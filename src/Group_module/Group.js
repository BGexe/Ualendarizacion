import React, {useEffect, useState, useRef} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {doc, getDoc, collection, query, where, getDocs, updateDoc} from 'firebase/firestore';
import {db} from '../Firebase';
import {getUserData} from '../Profile_module/UserService';
import imageCompression from 'browser-image-compression';
import {showError, showSuccess} from "../ShowAlert";
import "../style.css";

const applyGroupStyle = (color) => {
    document.body.style.background = `linear-gradient(to bottom, ${color} 40%, #ffffff 40%)`;
    document.documentElement.style.setProperty('--hover-color', color);
};

const Group = () => {
    const {id} = useParams();
    const [groupData, setGroupData] = useState(null);
    const [headerColor, setHeaderColor] = useState("#54a3ff");
    const [isUserInGroup, setIsUserInGroup] = useState(false);
    const [isPrivateGroup, setIsPrivateGroup] = useState(false);
    const [isProfessor, setIsProfessor] = useState(false);
    const [groupUsers, setGroupUsers] = useState([]);
    const [showUsersList, setShowUsersList] = useState(false);
    const [events, setEvents] = useState([]);
    const [profilePicture, setProfilePicture] = useState(null);
    const DEFAULT_GROUP_PICTURE = "/images/group.png"; // Imagen predeterminada para grupos
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const userId = JSON.parse(localStorage.getItem("user"))?.uid;

    useEffect(() => {
        document.body.style.background = `linear-gradient(to bottom, #54a3ff 40%, #ffffff 40%)`;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    useEffect(() => {
        if(headerColor){
            applyGroupStyle(headerColor);
        }
    }, [headerColor]);

    // Función para cargar los datos del grupo
    useEffect(() => {
            const fetchGroupData = async () => {
                try {
                    // Buscar el grupo (público o privado)
                    let groupRef = doc(db, "GrupoPublico", id);
                    let groupSnap = await getDoc(groupRef);
    
                    if (!groupSnap.exists()) {
                        groupRef = doc(db, "GrupoPrivado", id);
                        groupSnap = await getDoc(groupRef);
                        if(groupSnap.exists()) setIsPrivateGroup(true);
                    }
    
                    if (groupSnap.exists()) {
                        const group = groupSnap.data();
                        const profesorUID = group.profesor;
                        const professorData = await getUserData(group.profesor);
                        const professorName = `${professorData.nombre} ${professorData.apellido}`;
                        const userId = JSON.parse(localStorage.getItem("user"))?.uid;
                        setIsProfessor(userId === group.profesor);
                        setHeaderColor(group.headerColor);
                        setGroupData({ ...group, profesorUID: profesorUID, profesor: professorName });
                        setProfilePicture(group.profilePicture || DEFAULT_GROUP_PICTURE);
                        // Cargar eventos asociados al grupo
                        await fetchEvents(id);
                        if(group.Usuarios && group.Usuarios.length > 0){
                            const usersData = await Promise.all(
                                group.Usuarios.map(async (uid) => {
                                    const userData = await getUserData(uid);
                                    return{
                                        uid: uid,
                                        nombre: userData.nombre,
                                        apellido: userData.apellido,
                                        headerColor: userData.headerColor || "#54a3ff",
                                    };
                                })
                            );
                            setGroupUsers(usersData);
                        }
                        else{
                            setGroupUsers([]);
                        }
                    }
                    else{
                        console.error("El grupo no existe en ninguna colección");
                    }
                } catch (error) {
                    console.error("Error al cargar los datos del grupo:", error);
                }
            };
    
            fetchGroupData();
        }, [id]);

    useEffect(() => {
        const checkUserInGroup = async () => {
            if(!userId || !id) return;

            try{
                const userRef = doc(db, "users", userId);
                const userSnap = await getDoc(userRef);

                if(userSnap.exists()){
                    const userData = userSnap.data();
                    setIsUserInGroup(userData.UsuarioGrupo?.includes(id) || false);
                }
                else{
                    console.error("El usuario no existe.");
                }
            }
            catch(error){
                console.error("Error al verificar el grupo:", error);
            }
        };

        checkUserInGroup();
    }, [userId, id]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        showSuccess("Enlace copiado al portapapeles");
    };

    const fetchEvents = async (groupId) => {
            try {
                const eventsRef = collection(db, "Evento");
                const q = query(eventsRef, where("id_grupo", "==", groupId));
                const querySnapshot = await getDocs(q);
    
                const eventsData = await Promise.all(querySnapshot.docs.map(async (docSnap) => {
                    const eventData = docSnap.data();
                    return {
                        id: docSnap.id,
                        ...eventData,
                    };
                }));
    
                setEvents(eventsData);
            } catch (error) {
                console.error("Error al cargar los eventos:", error);
            }
        };

    const handleDeleteUser = async (userUid) => {
        try{
            // Actualizar colección del grupo
            const groupCollection = isPrivateGroup ? "GrupoPrivado" : "GrupoPublico";
            const groupRef = doc(db, groupCollection, id);
            const groupSnap = await getDoc(groupRef);
            const updatedUsuarios = groupSnap.data().Usuarios.filter(uid => uid !== userUid);
            await updateDoc(groupRef, { Usuarios: updatedUsuarios });
    
            // Actualizar colección del usuario
            const userRef = doc(db, "users", userUid);
            const userSnap = await getDoc(userRef);
            const updatedGrupos = userSnap.data().UsuarioGrupo.filter(gid => gid !== id);
            await updateDoc(userRef, { UsuarioGrupo: updatedGrupos });
            showSuccess("Usuario eliminado correctamente");
        }
        catch(error){
            console.error("Error al eliminar usuario:", error);
        }
    };

    const handleFollowGroup = async () => {
        try{
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);

            if(userSnap.exists()){
                const userData = userSnap.data();
                const updatedGroups = userData.UsuarioGrupo ? [...userData.UsuarioGrupo, id] : [id];

                const groupCollection = isPrivateGroup ? "GrupoPrivado" : "GrupoPublico";
                const groupRef = doc(db, groupCollection, id);
                const groupSnap = await getDoc(groupRef);

                if(groupSnap.exists()){
                    const groupData = groupSnap.data();
                    const updatedUsers = groupData.Usuarios ? [...groupData.Usuarios, userId] : [userId];
                    await updateDoc(userRef, { UsuarioGrupo: updatedGroups });
                    await updateDoc(groupRef, { Usuarios: updatedUsers });
                    setIsUserInGroup(true);
                    console.log("Grupo seguido exitosamente.");
                }
                else{
                    console.error("El grupo no existe.");
                }
            }
            else{
                console.error("El usuario no existe.");
            }
        }
        catch(error){
            console.error("Error al seguir el grupo:", error);
        }
    };

    const handleRemoveFromGroup = async () => {
        try{
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);

            if(userSnap.exists()){
                const userData = userSnap.data();
                const updatedGroups = userData.UsuarioGrupo.filter(groupId => groupId !== id);
                const groupCollection = isPrivateGroup ? "GrupoPrivado" : "GrupoPublico";
                const groupRef = doc(db, groupCollection, id);
                const groupSnap = await getDoc(groupRef);
                if(groupSnap.exists()){
                    const groupData = groupSnap.data();
                    const updatedUsers = groupData.Usuarios ? groupData.Usuarios.filter(uid => uid !== userId) : [];
                    await updateDoc(userRef, { UsuarioGrupo: updatedGroups });
                    await updateDoc(groupRef, { Usuarios: updatedUsers });
                    setIsUserInGroup(false);
                    console.log("Grupo eliminado exitosamente.");
                }
                else{
                    console.error("El grupo no existe.");
                }
            }
            else{
                console.error("El usuario no existe.");
            }
        }
        catch(error){
            console.error("Error al eliminar el grupo:", error);
        }
    };

    const toggleUsersList = () => {
        setShowUsersList(!showUsersList);
    };

    // Función para manejar la selección de una nueva foto de perfil
        const handleFileChange = async (event) => {
            const file = event.target.files[0];
            if (!file) return;
    
            try {
                let processedFile = file;
                if (file.size > 1024 * 1024) { // Comprimir si el archivo es mayor a 1MB
                    const compressionOptions = {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 800,
                        useWebWorker: true,
                    };
                    processedFile = await imageCompression(file, compressionOptions);
                }
    
                const base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(processedFile);
                });
    
                setProfilePicture(base64);
    
                // Actualizar la foto de perfil en Firestore
                const groupRef = doc(db, "GrupoPublico", id);
                const groupSnap = await getDoc(groupRef);
    
                if (!groupSnap.exists()) {
                    await updateDoc(doc(db, "GrupoPrivado", id), { profilePicture: base64 });
                } else {
                    await updateDoc(groupRef, { profilePicture: base64 });
                }
    
                showSuccess("Foto de perfil del grupo actualizada con éxito.");
            } catch (error) {
                showError("Error al actualizar la foto de perfil del grupo: " + error.message);
            }
        };

        const triggerFileInput = () => {
            fileInputRef.current.click();
        };

    const handleBack = () => {
        localStorage.removeItem('selectedGroup');
        navigate('/Profile');
    };

    if(!groupData){
        return <p>Buscando grupo...</p>;
    }

    return(
        <div className="profile-container">
            <div className="header-rectangle group-header" style={{ backgroundColor: headerColor }}>
                <button onClick={handleBack} className="exit-btn">
                    <span className="material-icons">arrow_back</span>
                </button>
                <div className="profile-picture" onClick={triggerFileInput}>
                    {profilePicture ? (
                        <img src={profilePicture} alt="Foto de perfil del grupo" className="profile-picture-img" />
                    ) : (
                        <p className="placeholder-text"></p>
                    )}
                    {/* Solo mostrar el botón de edición si el usuario es el profesor */}
                    {isProfessor && (
                        <>
                            <input
                                type="file"
                                accept="image/jpeg, image/png"
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                onChange={handleFileChange}
                            />
                            <span
                                className="edit-icon material-icons"
                                onClick={() => fileInputRef.current.click()}
                            >
                                edit
                            </span>
                        </>
                    )}
                </div>
                {isUserInGroup && (
                    <button onClick={handleRemoveFromGroup} className="trash-btn">
                        <span className="material-icons">delete</span>
                    </button>
                )}
                {isUserInGroup && (
                    <button onClick={toggleUsersList} className="users-btn">
                        <span className="material-icons">groups</span>
                    </button>
                )}
                {isPrivateGroup && (
                    <button onClick={handleCopyLink} className="share-btn">
                        <span className="material-icons">share</span>
                    </button>
                )}
                <div className="group-details">
                    <h1 className="group-title">{groupData.nombre_uea}</h1>
                    <p className="group-professor">{groupData.profesor}</p>
                    <p className="group-description">{groupData.descripcion}</p>
                </div>
                <div className="header-buttons">
                    {isUserInGroup ? (
                        <>
                            <button className="header-button" onClick={() => navigate(`/Edit-group/${id}`)}>
                                <span className="material-icons">edit</span>
                                Editar Grupo
                            </button>
                            <button className="header-button" onClick={() => navigate(`/Create-weekly-event/${id}`)}>
                                <span className="material-icons">event</span>
                                Crear Evento Semanal
                            </button>
                            <button className="header-button" onClick={() => navigate(`/Create-unique-event/${id}`)}>
                                <span className="material-icons">event</span>
                                Crear Evento Único
                            </button>
                        </>
                    ) : (
                        <button className="header-button" onClick={handleFollowGroup}>
                            <span className="material-icons">add</span>
                            Seguir Grupo
                        </button>
                    )}
                </div>
            </div>
            
            <h3>Eventos del Grupo</h3>
            {events.length === 0 ? (
                <p>No hay eventos disponibles para este grupo.</p>
            ) : (
                <div className='events-container'>
                    <div className="events-grid">
                        {events.map((event) => (
                            <div key={event.id} className={`event-card ${event.es_ciclico ? 'cyclic' : 'unique'}`}>
                                <h4>{event.nombre_evento}</h4>
                                <p>
                                    {event.es_ciclico ? (
                                        <>
                                            {["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]
                                                .filter((day) => event[day])
                                                .map((day) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${event[day]}`)
                                                .join(", ")}{" "}
                                                | Aula: {event.aula}
                                        </>
                                    ) : (
                                        `${event.dia_evento} a las ${event.hora_evento}`
                                    )}
                                </p>
                                <p className='description'>{event.descripcion}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showUsersList && (
                <div className="popup-overlay">
                    <div className="users-list-popup">
                        <button onClick={toggleUsersList} className="close-btn">
                            <span className="material-icons">close</span>
                        </button>
                        <h3>Usuarios en el grupo:</h3>
                        <div className="users-list-container">
                            {groupUsers.map((user, index) => (
                                <div 
                                    key={index} 
                                    className="user-container"
                                    style={{ backgroundColor: user.headerColor }}
                                >
                                    <span>{`${user.nombre} ${user.apellido}`}</span>
                                    {userId === groupData.profesorUID && user.uid !== groupData.profesorUID &&(
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDeleteUser(user.uid)}
                                        >
                                            <span className="material-icons">delete</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Group;