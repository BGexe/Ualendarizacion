// CreatePublicGroup.js ayuda a la creación de grupos publicos
import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {db, auth} from "../Firebase"; // Asegúrate de que este sea tu archivo Firebase
import {doc, setDoc, query, where, collection, getDocs, getDoc, orderBy, limit} from "firebase/firestore";
import {showError, showSuccess} from "../ShowAlert";
import "../style.css";
// funcion principal
const CreatePublicGroup = () => {
	const[color, setColor] = useState("#54a3ff");
	const[nombreUea, setNombreUea] = useState("");
	const[grupoUea, setGrupoUea] = useState("");
	const[claveUea, setClaveUea] = useState("");
	const[descripcion, setDescripcion] = useState("");
	const[profesor, setProfesor] = useState("");
	const[professoresList, setProfessoresList] = useState([]);
	const[idTrimestre, setIdTrimestre] = useState(null);
	const navigate = useNavigate();
	// Colores disponibles
	const availableColors = [
		{value: "#d53e4f", label: "Coral"},
		{value: "#930142", label: "Rojo"},
		{value: "#f46d43", label: "Naranja"},
		{value: "#fdae61", label: "Naranja-claro"},
		{value: "#fee08b", label: "Amarillo"},
		{value: "#ffffbf", label: "Amarillo-claro"},
		{value: "#e6f598", label: "Verde-limon"},
		{value: "#abdda4", label: "Verde-claro"},
		{value: "#66c2a5", label: "Verde"},
		{value: "#3288bd", label: "Azul"},
		{value: "#5e4fa2", label: "Morado"},
	];
	// Cargar datos de trimestre y profesores
	useEffect(() => {
		const fetchData = async () => {
			try{
				// Obtener el trimestre con el campo createdAt más reciente
				const trimestreQuery = query(
					collection(db, "Trimestre"),
					orderBy("createdAt", "desc"),
					limit(1)
				);
				const trimestreSnapshot = await getDocs(trimestreQuery);
				if(!trimestreSnapshot.empty){
					const trimestreDoc = trimestreSnapshot.docs[0];
					setIdTrimestre(trimestreDoc.data().id_trimestre); // Asigna el id_trimestre más reciente
				}
				// Obtener lista de profesores desde la colección 'users'
				const professorsQuery = query(collection(db, "users"), where("profesor", "==", true));
				const querySnapshot = await getDocs(professorsQuery);
				const professors = querySnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setProfessoresList(professors);
			}
			catch(error){
				showError("Error al cargar los datos", error.message);
			}
		};
		fetchData();
	}, []);
	useEffect(() => {
		const storedUser = JSON.parse(localStorage.getItem("user"));
		if(storedUser){
			document.body.style.background = `linear-gradient(to bottom, ${storedUser.headerColor || "#54a3ff"} 40%, #ffffff 40%)`;
		}
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "auto";
		};
	}, []);
	// Manejar la creación del grupo
	const handleCreateGroup = async () => {
		if(!profesor || !nombreUea || !grupoUea || !claveUea || !descripcion){
			showError("Por favor, completa todos los campos obligatorios.");
			return;
		}
	
		const claveUeaNumerica = Number(claveUea);
		if(isNaN(claveUeaNumerica)){
			showError("La clave de UEA debe ser un número.");
			return;
		}
	
		if(!idTrimestre){
			showError("No se pudo obtener el trimestre actual.");
			return;
		}
	
		try{
			const groupRef = collection(db, "GrupoPublico");
			const groupQuery = query(
				groupRef,
				where("clave_uea", "==", claveUeaNumerica),
				where("grupo_uea", "==", grupoUea),
				where("id_trimestre", "==", idTrimestre)
			);
			const querySnapshot = await getDocs(groupQuery);
	
			if(!querySnapshot.empty){
				showError("Este grupo ya existe.");
				return;
			}
			const userId = auth.currentUser?.uid;
			if(!userId){
				showError("Usuario no autenticado.");
				return;
			}
			const newGroupData = {
				profesor: profesor,
				nombre_uea: nombreUea,
				grupo_uea: grupoUea,
				clave_uea: claveUeaNumerica,
				descripcion: descripcion,
				id_trimestre: idTrimestre,
				headerColor: color,
				Usuarios: [userId],
			};
	
			const groupId = `${claveUea}_${grupoUea}_${idTrimestre}`;
			await setDoc(doc(db, "GrupoPublico", groupId), newGroupData);
			const userDocRef = doc(db, "users", userId);
			const userDocSnapshot = await getDoc(userDocRef);
	
			if(userDocSnapshot.exists()){
				const userData = userDocSnapshot.data();
				const updatedGroups = userData.UsuarioGrupo || [];
				updatedGroups.push(groupId);
	
				await setDoc(userDocRef, { UsuarioGrupo: updatedGroups }, { merge: true });
			}
			else{
				await setDoc(userDocRef, { UsuarioGrupo: [groupId] }, { merge: true });
			}
	
			showSuccess("Grupo creado exitosamente.");
			navigate(`/Group/${groupId}`);
		}
		catch(error){
			showError("Error al crear el grupo: " + error.message);
		}
	};
	return(
		<div className="container">
			<button className="close-btn" onClick={() => navigate("/Profile")}>
				X
			</button>
			<img src="/images/group.png" alt="Logo" className="group" />
			{/* Selector de color */}
			<div className="color-selector">
				<div className="color-buttons">
					{availableColors.map((colorOption) => (
						<button
							key={colorOption.value}
							className={`color-button ${color === colorOption.value ? "selected" : ""}`}
							style={{ backgroundColor: colorOption.value }}
							onClick={() => setColor(colorOption.value)}
							title={colorOption.label}
						/>
					))}
				</div>
			</div>
			<div className="input-wrapper">
				{/* Selección de profesor */}
				<select
					value={profesor}
					onChange={(e) => setProfesor(e.target.value)}
					required
				>
				<option value="" disabled>Selecciona un profesor</option>
				{professoresList.map((profesor) => (
					<option key={profesor.id} value={profesor.id}>
						{profesor.nombre} {profesor.apellido} {/* Mostrar nombre y apellido del profesor */}
					</option>
				))}
				</select>
				<input
					type="text"
					placeholder="Nombre de UEA"
					value={nombreUea}
					onChange={(e) => setNombreUea(e.target.value)}
				/>
				<input
					type="text"
					placeholder="Grupo de UEA"
					value={grupoUea}
					onChange={(e) => setGrupoUea(e.target.value.toUpperCase())}
				/>
				<input
					type="text"
					placeholder="Clave de UEA"
					value={claveUea}
					onChange={(e) => {
						const newValue = e.target.value;
						// Permitir solo números (eliminar cualquier carácter no numérico)
						if(/^\d*$/.test(newValue)){
							setClaveUea(newValue);
						}
					}}
				/>
				<textarea
					placeholder="Descripción del grupo"
					value={descripcion}
					onChange={(e) => setDescripcion(e.target.value)}
				/>
			</div>
			<button onClick={handleCreateGroup} type="submit" className="submit">
				Guardar Grupo
			</button>
		</div>
	);
};

export default CreatePublicGroup;