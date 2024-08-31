import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GlobalStyles from './GlobalStyles';
import Header from './Header';
import Signup from './pages/Signup';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { useLoggedInUser } from './contexts/LoggedInUserContext';

const PrivateRoute = ({ element, ...rest }) => {
    const { loggedInUser } = useLoggedInUser();
    return loggedInUser ? element : <Navigate to="/login" />;
};

const App = () => {
    return (
        <>
            <GlobalStyles />
            <Header />
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard/:name" element={<PrivateRoute element={<Dashboard />} />} />
                <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    );
};

export default App;