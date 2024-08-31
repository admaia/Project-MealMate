import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { LoggedInUserContext } from "./contexts/LoggedInUserContext";

const Header = () => {
    const { loggedInUser, logOut } = useContext(LoggedInUserContext);
    const navigate = useNavigate();
    
    const OnLogOut = () => {
        logOut();
        navigate('/');
    };

    const userName = loggedInUser ? loggedInUser.name : '';

    const handleProfileClick = () => {
      navigate('/profile');
  };
  
    return (
        <Wrapper>
            {loggedInUser ? (
                <NavItem to={`/dashboard/${userName}`}>Dashboard</NavItem>
            ) : (
                <NavItem to="/">MealMate</NavItem>
            )}
            <div>
                {!loggedInUser ? (
                    <NavItem to="/login">Log in</NavItem>
                ) : (
                    <>
                        <ProfileLink onClick={handleProfileClick}>Hello, {userName}</ProfileLink>
                        <LogOutButton onClick={OnLogOut}>Log out</LogOutButton>
                    </>
                )}
            </div>
        </Wrapper>
    );
};

export default Header;

const NavItem = styled(NavLink)`
  margin: 0 .5rem;
  text-decoration: none;
  box-sizing: border-box;
  padding: 5px;
  color: white;
  border-bottom: var(--base-size) solid transparent;
  &.active {
    border-color: var(--accent-color);
  }
  &:hover {
    border-color: black;
  }
`;

const Wrapper = styled.nav`
  background-color: var(--primary-color);
  display: flex;
  justify-content: space-between;
  font-family: var(--heading-font-family);
  & div {
    margin-top: var(--base-size);
  }
`;

const ProfileLink = styled.span`
  margin: 0 .5rem;
  text-decoration: none;
  color: white;
  cursor: pointer;
  &:hover {
    border-bottom: 1px solid white; 
  }
`;

const LogOutButton = styled.button`
  margin: 0 .5rem;
  padding: 5px;
  color: white;
  background: transparent;
  border: none;
  cursor: pointer;
  text-decoration: none;
  &:hover {
    border-color: black;
  }
`;