// Firebase.js Ayuda a inicializaenos firebase con nuestros datos de Firebase console
import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
// Configuraciones de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCLISEawqJ-N71u276UHb-_1KECNdQ4i6A",
    authDomain: "ualendarizacion-uam.firebaseapp.com",
    projectId: "ualendarizacion-uam",
    storageBucket: "ualendarizacion-uam.firebasestorage.app",
    messagingSenderId: "183817969866",
    appId: "1:183817969866:web:d9e61a652fe9e0b30d1433",
    measurementId: "G-BT3T7W4247"
};
// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
// Inicialización del servicio de autenticación de Firebase con la aplicación inicializada
export const auth = getAuth(app);
// Inicializa el servicio Firestore de Firebase, que permite la interacción con la base de datos de Firestore.
export const db = getFirestore(app);