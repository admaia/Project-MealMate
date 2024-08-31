import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import LoggedInUserProvider from './contexts/LoggedInUserContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <Router>
        <LoggedInUserProvider>
            <App />
        </LoggedInUserProvider>
    </Router>
);