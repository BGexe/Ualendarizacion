// ShowAlert.js nos sirve para crear las ventanas de alerta de error o de éxito
// Función para mostrar un mensaje de error
export const showError = (message) => {
    // Añade un fondo semi-transparente detrás del mensaje de alerta para enfatizar el foco en la ventana emergente.
    const overlay = document.createElement("div");
    overlay.className = "overlay"; // Asigna una clase al overlay para poder estilizarlo con CSS.
    document.body.appendChild(overlay); // Añade el overlay al cuerpo del documento.
    // Genera un elemento HTML que contiene el mensaje de error y un botón para cerrarlo.
    const alertContainer = document.createElement("div");
    alertContainer.className = "error"; // Asigna una clase al contenedor para identificarlo como alerta de error.
    alertContainer.innerHTML = `
        <div class="error-container">
            <p>${message}</p> <!-- Muestra el mensaje de error pasado como parámetro. -->
            <button class="error-ok">Ok</button> <!-- Botón para cerrar la alerta. -->
        </div>
    `;
    document.body.appendChild(alertContainer); // Añade el contenedor al cuerpo del documento.
    // Define el comportamiento del botón para cerrar tanto la alerta como el overlay.
    const closeButton = alertContainer.querySelector(".error-ok");
    closeButton.addEventListener("click", () => {
        document.body.removeChild(alertContainer);
        document.body.removeChild(overlay);
    });
};

// Función para mostrar un mensaje de éxito
export const showSuccess = async (message) => {
    // Añade un fondo semi-transparente detrás del mensaje de alerta para enfatizar el foco en la ventana emergente.
    const overlay = document.createElement("div");
    overlay.className = "overlay"; // Asigna una clase al overlay para poder estilizarlo con CSS.
    document.body.appendChild(overlay); // Añade el overlay al cuerpo del documento.
    // Genera un elemento HTML que contiene el mensaje de success y un botón para cerrarlo.
    const alertContainer = document.createElement("div");
    alertContainer.className = "success"; // Asigna una clase al contenedor para identificarlo como alerta de success.
    alertContainer.innerHTML = `
        <div class="success-container">
            <p>${message}</p> <!-- Muestra el mensaje de success pasado como parámetro. -->
            <button class="success-ok">Ok</button> <!-- Botón para cerrar la alerta. -->
        </div>
    `;
    document.body.appendChild(alertContainer); // Añade el contenedor al cuerpo del documento.
    // Define el comportamiento del botón para cerrar tanto la alerta como el overlay.
    const closeButton = alertContainer.querySelector(".success-ok");
    closeButton.addEventListener("click", () => {
        document.body.removeChild(alertContainer);
        document.body.removeChild(overlay);
    });
};