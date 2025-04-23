import React, {useState, useEffect, useRef, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {auth, db} from '../Firebase';
import {collection, query, where, getDocs, getDoc, deleteDoc, doc, limit, updateDoc} from "firebase/firestore";
import {signOut} from 'firebase/auth';
import imageCompression from 'browser-image-compression';
import {updateUserProfile, getUserData} from "./UserService";
import {showError, showSuccess} from '../ShowAlert';
import "../style.css";

const applyUserStyle = (color) => {
    document.body.style.background = `linear-gradient(to bottom, ${color} 40%, #ffffff 40%)`;
    document.documentElement.style.setProperty('--hover-color', color);
};

const validateGroups = async () => {
    try{
        const now = new Date();
        //const trimestresRef = collection(db, "Trimestre");
        //const trimestreQuery = query(trimestresRef, where("fin_trimestre", "<", now));
        const trimestreSnapshot = await getDocs(
            query(
                collection(db, "Trimestre"),
                where("fin_trimestre", "<", now)
            )
        );

        if(!trimestreSnapshot.empty){
            //const expiredTrimestres = trimestreSnapshot.docs.map(doc => doc.data().id_trimestre);
            //const groupRef = collection(db, "GrupoPublico");
            //const groupQuery = query(groupRef, where("id_trimestre", "in", expiredTrimestres));
            const groupSnapshot = await getDocs(
                query(
                    collection(db, "GrupoPublico"),
                    where("id_trimestre", "in",
                        trimestreSnapshot.docs.map(doc => doc.data().id_trimestre)
                    )
                )
            );

            if(!groupSnapshot.empty){
                await Promise.all(groupSnapshot.docs.map(async (docSnap) => {
                    const groupId = docSnap.id;
                    await deleteDoc(doc(db, "GrupoPublico", groupId));

                    //const usersRef = collection(db, "users");
                    //const usersQuery = query(usersRef, where("UsuarioGrupo", "array-contains", groupId));
                    const usersSnapshot = await getDocs(
                        query(
                            collection(db, "users"),
                            where("UsuarioGrupo", "array-contains", groupId)
                        )
                    );

                    if(!usersSnapshot.empty){
                        await Promise.all(usersSnapshot.docs.map(async (userDoc) => {
                            const userData = userDoc.data();
                            //const updatedGroups = userData.UsuarioGrupo.filter(id => id !== groupId);
                            await updateDoc(doc(db, "users", userDoc.id), { 
                                UsuarioGrupo: userData.UsuarioGrupo.filter(
                                    id => id !== groupId
                                )
                            });
                        }));
                    }
                }));
            }
        }

        //const publicGroupRef = collection(db, "GrupoPublico");
        //const privateGroupRef = collection(db, "GrupoPrivado");
        const [publicGroupSnapshot, privateGroupSnapshot] = await Promise.all([
            getDocs(collection(db, "GrupoPublico")),
            getDocs(collection(db, "GrupoPrivado")),
        ]);

        const deleteEmptyGroups = async (snapshot, collectionName) => {
            if(!snapshot.empty){
                await Promise.all(snapshot.docs.map(async (docSnap) => {
                    const groupData = docSnap.data();
                    if(!groupData.Usuarios || groupData.Usuarios.length === 0){
                        await deleteDoc(doc(db, collectionName, docSnap.id));
                    }
                }));
            }
        };

        await deleteEmptyGroups(publicGroupSnapshot, "GrupoPublico");
        await deleteEmptyGroups(privateGroupSnapshot, "GrupoPrivado");

        console.log("Validación de grupos completada.");
    }
    catch(error){
        showError("Error al validar y eliminar grupos: " + error.message);
    }
};

const Profile = () => {
    const [user, setUser] = useState(null);
    const [headerColor, setHeaderColor] = useState("#54a3ff");
    const [profilePicture, setProfilePicture] = useState(null);
    const DEFAULT_PROFILE_PICTURE = "/images/profile.png";
    const [searchTerm, setSearchTerm] = useState("");
    const [publicGroups, setPublicGroups] = useState([]);
    const [showUnfollowed, setShowUnfollowed] = useState(false);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    useEffect(() => {
        document.body.style.background = `linear-gradient(to bottom, #54a3ff 40%, #ffffff 40%)`;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    useEffect(() => {
        const loadUserData = async () => {
            const savedUserData = JSON.parse(localStorage.getItem("user"));
            if(savedUserData){
                setUser(savedUserData);
                setProfilePicture(savedUserData.photoBase64 || DEFAULT_PROFILE_PICTURE);
                setHeaderColor(savedUserData.headerColor);
                applyUserStyle(savedUserData.headerColor);
            }
            else{
                try{
                    const userData = await getUserData(auth.currentUser.uid);
                    setUser(userData);
                    setProfilePicture(userData.photoBase64 || DEFAULT_PROFILE_PICTURE);
                    setHeaderColor(userData.headerColor);
                    applyUserStyle(userData.headerColor);
                    localStorage.setItem("user", JSON.stringify(userData));
                }
                catch(error){
                    navigate("/");
                }
            }
        };
        loadUserData();
        validateGroups();
    }, [navigate]);

    const handleSignOut = async () => {
        try{
            await signOut(auth);
            localStorage.removeItem('user');
            navigate('/');
        }
        catch(error){
            showError("Error al cerrar sesión: " + error.message);
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if(!file) return;

        try{
            let processedFile = file;
            if(file.size > 1024 * 1024){
                const compressionOptions = { maxSizeMB: 1, maxWidthOrHeight: 800, useWebWorker: true };
                processedFile = await imageCompression(file, compressionOptions);
            }

            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(processedFile);
            });

            setProfilePicture(base64);
            await updateUserProfile(user.uid, null, null, base64);
            showSuccess("Foto de perfil actualizada con éxito.");        

            const updatedUser = { ...user, photoBase64: base64 };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
        }
        catch(error){
            showError(`Error al procesar la imagen: ${error.message}`);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const fetchGroupData = async (groupId) => {
        const publicGroupDoc = await getDoc(doc(db, "GrupoPublico", groupId));
        const privateGroupDoc = await getDoc(doc(db, "GrupoPrivado", groupId));
        const groupDoc = publicGroupDoc.exists() ? publicGroupDoc : privateGroupDoc;

        if(groupDoc.exists()){
            const groupData = groupDoc.data();
            const professorData = await getUserData(groupData.profesor);
            return{
                id: groupDoc.id,
                ...groupData,
                profesor: `${professorData.nombre} ${professorData.apellido}`,
            };
        }
        return null;
    };

    const searchGroups = useCallback(async () => {
        if(!user) return;
    
        try{
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if(!userDoc.exists()) throw new Error("No se encontró el usuario.");
    
            const followedGroupIds = userDoc.data().UsuarioGrupo || [];
            const trimmedSearchTerm = searchTerm?.trim() || "";
    
            if(showUnfollowed){
                if(trimmedSearchTerm === ""){
                    setPublicGroups([]);
                    return;
                }
    
                const publicGroupRef = collection(db, "GrupoPublico");
                const publicSearchQuery = query(
                    publicGroupRef,
                    where("nombre_uea", ">=", trimmedSearchTerm),
                    where("nombre_uea", "<", trimmedSearchTerm + "\uf8ff"),
                    limit(20)
                );
                const publicSnapshot = await getDocs(publicSearchQuery);
    
                const publicGroups = await Promise.all(
                    publicSnapshot.docs
                        .filter((doc) => !followedGroupIds.includes(doc.id))
                        .map(async(doc) => {
                            const groupData = doc.data();
                            const professorData = await getUserData(groupData.profesor);
                            return{
                                id: doc.id,
                                ...groupData,
                                profesor: `${professorData.nombre} ${professorData.apellido}`,
                            };
                        })
                );
                setPublicGroups(publicGroups);
                return;
            }
    
            const groupPromises = followedGroupIds.map(fetchGroupData);
            const followedGroups = await Promise.all(groupPromises);
            const filteredGroups = trimmedSearchTerm
                ? followedGroups.filter(
                      (group) =>
                          group &&
                          group.nombre_uea &&
                          group.nombre_uea.toLowerCase().includes(trimmedSearchTerm.toLowerCase())
                  )
                : followedGroups.filter((group) => group !== null);
    
            setPublicGroups(filteredGroups);
        }
        catch(error){
            showError("Error al buscar grupos: " + error.message);
        }
    }, [searchTerm, user, showUnfollowed]);

    useEffect(() => {
        if(user) searchGroups();
    }, [searchTerm, showUnfollowed, user, searchGroups]);

    return(
        <div className="profile-container">
            {user ? (
                <>
                    <div className="header-rectangle" style={{ backgroundColor: headerColor }}>
                        <button onClick={handleSignOut} className="exit-btn">
                            <span className="material-icons">logout</span>
                        </button>
                        <div className="profile-picture" onClick={triggerFileInput}>
                            {profilePicture ? (
                                <img src={profilePicture} alt="Foto de perfil" className="profile-picture-img" />
                            ) : (
                                <p className="placeholder-text"></p>
                            )}
                            <input type="file" accept="image/jpeg, image/png" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
                            <span className="edit-icon material-icons">edit</span>
                        </div>
                        <p className="user-name">{user.nombre} {user.apellido}</p>
                        <div className="header-buttons">
                            <button className="header-button" onClick={() => navigate("/edit-profile")}>
                                <span className="material-icons">edit</span>
                                Editar Perfil
                            </button>
                            <button className="header-button" onClick={() => navigate("/create-public-group")}>
                                <span className="material-icons">add</span>
                                Crear Grupo Público
                            </button>
                            <button className="header-button" onClick={() => navigate("/create-private-group")}>
                                <span className="material-icons">add</span>
                                Crear Grupo Privado
                            </button>
                        </div>
                    </div>
                    <div className="search-bar">
                        <input type="text" placeholder="Buscar grupos" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <label className="checkbox-container">
                            <input 
                                type="checkbox" 
                                checked={showUnfollowed} 
                                onChange={(e) => setShowUnfollowed(e.target.checked)} 
                                className="checkbox"
                            />
                            <span className="material-icons checkbox-icon">check</span>
                        </label>
                        <span className="checkbox-text">Grupos no seguidos</span>
                    </div>
                    <div className="groups-container">
                        <div className="group-grid">
                            {publicGroups.map((group) => (
                                <div
                                    key={group.id}
                                    className="group-card"
                                    style={{ backgroundColor: group.headerColor }}
                                    onClick={() => {
                                        localStorage.setItem("selectedGroup", JSON.stringify(group));
                                        navigate(`/group/${group.id}`);
                                    }}
                                >
                                    <p>{group.nombre_uea}</p>
                                    <p>{group.profesor}</p>
                                    <p className="description">{group.descripcion}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
};

export default Profile;