// App.js
import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Register from './Auth_module/Register';
import Login from './Auth_module/Login';
import ResetPassword from './Auth_module/ResetPassword';
import Profile from './Profile_module/Profile';
import EditProfile from "./Profile_module/EditProfile";
import CreatePublicGroup from "./Profile_module/CreatePublicGroup";
import CreatePrivateGroup from "./Profile_module/CreatePrivateGroup";
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
                <Route path="/Edit-profile" element={<EditProfile />} />
                <Route path="/Create-public-group" element={<CreatePublicGroup />} />
                <Route path="/Create-private-group" element={<CreatePrivateGroup />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;