import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { LoggedInUserContext } from "./contexts/LoggedInUserContext";
import dashboard from "./assets/dashboard.png";
import logoutLogo from "./assets/logout.png";
import profile from "./assets/profile.png";

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
            <TopSection>
                <Brand>MealMate</Brand>
                <NavItem to={`/dashboard/${userName}`}>
                    <img src={dashboard} alt="dashboard-logo" />
                    Dashboard
                </NavItem>
                <ProfileLink onClick={handleProfileClick}>
                    <img src={profile} alt="profile-logo" />
                    {loggedInUser.name }'s Profile
                </ProfileLink>
            </TopSection>
            <BottomSection>
                <LogOutButton onClick={OnLogOut}>
                    <img src={logoutLogo} alt="logout-logo" />
                    Log out
                </LogOutButton>
            </BottomSection>
        </Wrapper>
    );
};

export default Header;

const Wrapper = styled.nav`
  background-color: #5fad56;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
  width: 200px;
  padding: 20px;
  position: fixed;
  align-items: center;
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: auto; 
`;

const BottomSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: auto; 
  margin-bottom: 20px; 
`;

const Brand = styled.h1`
  font-size: 2rem; 
  font-weight: 700;
  color: white;
  margin-bottom: 3rem; 
  text-align: center;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: black;
  font-size: 1.2rem;
  margin: 1rem 0; 
  width: 100%; 
  text-align: center;

  img {
    margin-right: 10px; 
    width: 24px; 
    height: 24px; 
  }

  &:hover {
    color: white;
  }
`;

const ProfileLink = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: black;
  font-size: 1.2rem;
  margin: 1rem 0; 
  width: 100%;
  text-align: center; 

  img {
    margin-right: 10px; 
    width: 24px; 
    height: 24px; 
  }

  &:hover {
    color: white; 
  }
`;

const LogOutButton = styled.button`
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: black;
  font-size: 1.2rem;
  margin: 1rem 0;
  width: 100%;
  text-align: center;

  img {
    margin-right: 10px;
    width: 24px;
    height: 24px; 
  }

  &:hover {
    color: white
  }
`;
