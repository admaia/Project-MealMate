import React, { createContext, useState, useEffect, useContext } from 'react';

export const LoggedInUserContext = createContext();

const LoggedInUserProvider = ({ children }) => {
    const [loggedInUser, setLoggedInUser] = useState(null);

    const logIn = async ({ email, password }) => {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }
    
        const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
    
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Failed to log in');
        }
        setLoggedInUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
    
        return data.user;
    };

    const logOut = () => {
        setLoggedInUser(null);
        localStorage.removeItem('user');
    };

    const updateUserProfile = (updatedUser) => {
        setLoggedInUser(prevState => {
            const updatedState = { ...prevState, ...updatedUser };
            localStorage.setItem('user', JSON.stringify(updatedState));
            return updatedState;
        });
    };

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const parsedUser = JSON.parse(user);
                setLoggedInUser(parsedUser);
            } catch (error) {
                console.error('Error parsing user data from localStorage:', error);
            }
        }
    }, []);

    return (
        <LoggedInUserContext.Provider value={{ loggedInUser, logIn, logOut, updateUserProfile }}>
            {children}
        </LoggedInUserContext.Provider>
    );
};

export default LoggedInUserProvider;

export const useLoggedInUser = () => useContext(LoggedInUserContext);