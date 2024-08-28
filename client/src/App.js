import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes as Switch, Route, Navigate } from "react-router-dom";
import Header from "./Header";

const App = () => {
return (
    <Router>
        <Header />
    </Router>
);
};

export default App;
