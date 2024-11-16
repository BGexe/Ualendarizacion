// App.js
import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Register from './Auth_module/Register';
import Login from './Auth_module/Login';
import ResetPassword from './Auth_module/ResetPassword';
import Profile from './Profile';
import Error404 from './Error404';

const App = () => {
    return(
        <Router>
            <div>
                <Routes>
                <Route path="*" element={<Error404 />} />
                <Route path="/" element={<Login />} />
                <Route path="/ResetPassword" element={<ResetPassword />} />
                <Route path="/Register" element={<Register />} />
                <Route path="/Profile" element={<Profile />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;