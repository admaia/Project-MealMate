import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Welcome = () => {
const navigate = useNavigate();

return (
    <Main>
    <Content>
        <Title>Welcome to MealMate</Title>
        <Subtitle>Your Ultimate Calorie Tracker</Subtitle>
        <Description>
        Track your daily calorie intake, manage your meals, and stay on top of your health goals. 
        With MealMate, you can easily add recipes, view your daily total calories, and get insightful 
        recommendations to help you make healthier choices.
        </Description>
        <Buttons>
        <Button onClick={() => navigate('/signup')}>Start today !</Button>
        </Buttons>
    </Content>
    </Main>
);
};

export default Welcome;

const Main = styled.main`
    min-height: calc(100vh - 2.5rem);
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    `;

    const Content = styled.div`
    background: rgba(0, 0, 0, 0.6); 
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h1`
    font-size: 3rem;
    margin-bottom: 1rem;
`;

const Subtitle = styled.h2`
    font-size: 1.5rem;
    margin-bottom: 1rem;
`;

const Description = styled.p`
    font-size: 1rem;
    margin-bottom: 2rem;
`;

const Buttons = styled.div`
    display: flex;
    justify-content: center;
    gap: 1rem;
`;

const Button = styled.button`
    padding: 0.75rem 2rem;
    font-size: 1rem;
    color: #fff;
    background-color: orangered;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: orange;
    }
`;