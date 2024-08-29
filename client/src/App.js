import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import GlobalStyles from "./GlobalStyles";
import Header from "./Header";
import Signup from "./pages/Signup";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LoggedInUserProvider from "./contexts/LoggedInUserContext"; 

const App = () => {
    return (
        <LoggedInUserProvider>
            <Router>
                <GlobalStyles />
                <Header /> 
                <Routes>
                    <Route path="*" element={<Navigate to="/" />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard/:name" element={<Dashboard />} />
                    <Route path="/" element={<Welcome />} /> 
                </Routes>
            </Router>
        </LoggedInUserProvider>
    );
};

export default App;