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

    return (
        <Wrapper>
            {loggedInUser ? (
                <NavItem to={`/dashboard/${loggedInUser.user.name}`}>Dashboard</NavItem>
            ) : (
                <NavItem to="/">MealMate</NavItem>
            )}
            <div>
                {!loggedInUser ? (
                    <NavItem to="/login">Log in</NavItem>
                ) : (
                    <>
                        <NavItem>Hello, {loggedInUser.user.name}</NavItem>
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