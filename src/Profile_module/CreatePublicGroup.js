import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../Firebase"; // Asegúrate de que este sea tu archivo Firebase
import { doc, setDoc, query, where, collection, getDocs, orderBy, limit } from "firebase/firestore";
import { showError, showSuccess } from "../ShowAlert";
import "../style.css";

const CreatePublicGroup = () => {
  const [color, setColor] = useState("#54a3ff");
  const [nombreUea, setNombreUea] = useState("");  // Grupo de UEA
  const [grupoUea, setGrupoUea] = useState("");  // Grupo de UEA
  const [claveUea, setClaveUea] = useState("");  // Clave de UEA
  const [descripcion, setDescripcion] = useState("");  // Descripción
  const [profesor, setProfesor] = useState("");  // Profesor (selección)
  const [professoresList, setProfessoresList] = useState([]);  // Lista de profesores
  const [idTrimestre, setIdTrimestre] = useState(null);  // id_trimestre (oculto)
  const navigate = useNavigate();

  // Colores disponibles
  const availableColors = [
    { value: "#930142", label: "Rojo" },
    { value: "#d53e4f", label: "Coral" },
    { value: "#f46d43", label: "Naranja" },
    { value: "#fdae61", label: "Naranja-claro" },
    { value: "#fee08b", label: "Amarillo" },
    { value: "#ffffbf", label: "Amarillo-claro" },
    { value: "#e6f598", label: "Verde-limon" },
    { value: "#abdda4", label: "Verde-claro" },
    { value: "#66c2a5", label: "Verde" },
    { value: "#3288bd", label: "Azul" },
    { value: "#5e4fa2", label: "Morado" },
  ];

  // Cargar datos de trimestre y profesores
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener el último trimestre de la colección "Trimestre"
        const trimestreQuery = query(collection(db, "Trimestre"), orderBy("id_trimestre", "desc"), limit(1));
        const trimestreSnapshot = await getDocs(trimestreQuery);
        if (!trimestreSnapshot.empty) {
          const trimestreDoc = trimestreSnapshot.docs[0];
          setIdTrimestre(trimestreDoc.data().id_trimestre); // Obtener el valor de id_trimestre
        }

        // Obtener lista de profesores desde la colección 'users'
        const professorsQuery = query(collection(db, "users"), where("profesor", "==", true));
        const querySnapshot = await getDocs(professorsQuery);
        const professors = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProfessoresList(professors);
      } catch (error) {
        showError("Error al cargar los datos", error.message);
      }
    };
    fetchData();
  }, []);

  // Deshabilitar y habilitar scroll
  useEffect(() => {
    // Deshabilitar scroll
    document.body.style.overflow = "hidden";
    // Restaurar scroll al desmontar el componente
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Manejar la creación del grupo
  const handleCreateGroup = async () => {
    // Validar si todos los campos están completos
    if (!profesor || !nombreUea || !grupoUea || !claveUea || !descripcion) {
        showError("Por favor, completa todos los campos obligatorios.");
        return;
    }
    const groupRef = collection(db, "GrupoPublico");

    // Verificar si el grupo ya existe
    const groupQuery = query(
      groupRef,
      where("clave_uea", "==", parseInt(claveUea)),
      where("grupo_uea", "==", grupoUea),
      where("id_trimestre", "==", idTrimestre)
    );

    const querySnapshot = await getDocs(groupQuery);
    if (!querySnapshot.empty) {
      showError("Este grupo ya existe.");
      return;
    }

    try {
      // Crear el nuevo grupo en Firestore
      const newGroupData = {
        profesor: profesor,
        nombre_uea: nombreUea,
        grupo_uea: grupoUea,
        clave_uea: parseInt(claveUea),
        descripcion: descripcion,
        id_trimestre: idTrimestre, // Campo oculto pero almacenado
        headerColor: color,
      };

      await setDoc(doc(db, "GrupoPublico", `${claveUea}_${grupoUea}_${idTrimestre}`), newGroupData);
      showSuccess("Grupo creado exitosamente.");
      navigate("/Profile");
    } catch (error) {
      showError("Error al crear el grupo: " + error.message);
    }
  };

  return (
    <div className="create-public-group-container container">
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
            if (/^\d*$/.test(newValue)) {
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