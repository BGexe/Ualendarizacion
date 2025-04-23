import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Register from './Auth_module/Register';
import Login from './Auth_module/Login';
import ResetPassword from './Auth_module/ResetPassword';
import Profile from './Profile_module/Profile';
import EditProfile from "./Profile_module/EditProfile";
import CreatePublicGroup from './Profile_module/CreatePublicGroup';
import CreatePrivateGroup from './Profile_module/CreatePrivateGroup';
import Group from './Group_module/Group';
import EditGroup from './Group_module/EditGroup';
import CreateWeeklyEvent from './Group_module/CreateWeeklyEvent';
import CreateUniqueEvent from './Group_module/CreateUniqueEvent';
import EventAuthorization from './Group_module/EventAuthorization';
import Error404 from './Error404';

const App = () => {
    return (
        <Router
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
            }}
        >
            <Routes>
                <Route path="*" element={<Error404 />} />
                <Route path="/" element={<Login />} />
                <Route path="/ResetPassword" element={<ResetPassword />} />
                <Route path="/Register" element={<Register />} />
                <Route path="/Profile" element={<Profile />} />
                <Route path="/Edit-profile" element={<EditProfile />} />
                <Route path="/Create-public-group" element={<CreatePublicGroup />} />
                <Route path="/Create-private-group" element={<CreatePrivateGroup />} />
                <Route path="/Group/:id" element={<Group />} />
                <Route path="/Edit-group/:id" element={<EditGroup />} />
                <Route path="/Create-weekly-event/:id" element={<CreateWeeklyEvent />} />
                <Route path="/Create-unique-event/:id" element={<CreateUniqueEvent />} />
                <Route path="/Event-authorization/:id" element={<EventAuthorization />} />
            </Routes>
        </Router>
    );
};

export default App;