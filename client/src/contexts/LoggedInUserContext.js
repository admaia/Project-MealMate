import React, { createContext, useState } from 'react';

export const LoggedInUserContext = createContext();

const LoggedInUserProvider = ({ children }) => {
    const [loggedInUser, setLoggedInUser] = useState(null);

    const logIn = (user) => {
        setLoggedInUser(user);
    };

    const logOut = () => {
        setLoggedInUser(null);
    };
    return (
        <LoggedInUserContext.Provider value={{ loggedInUser, logIn, logOut }}>
            {children}
        </LoggedInUserContext.Provider>
    );
};

export default LoggedInUserProvider;