import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Welcome = () => {
    const navigate = useNavigate();

    return (
        <>
            <Main>
                <Overlay>
                    <Content>
                        <Title>Welcome to MealMate</Title>
                        <Subtitle>Your Ultimate Calorie Tracker</Subtitle>
                        <Description>
                            Track your daily calorie intake, manage your meals, and stay on top of your health goals. 
                            With MealMate, you can easily add recipes, view your daily total calories, and get insightful 
                            recommendations to help you make healthier choices.
                        </Description>
                        <Features>
                            <Feature>
                                <Icon>🍽️</Icon>
                                <FeatureTitle>Easy Meal Tracking</FeatureTitle>
                                <FeatureDescription>Quickly add your meals and track your daily calorie intake effortlessly.</FeatureDescription>
                            </Feature>
                            <Feature>
                                <Icon>📊</Icon>
                                <FeatureTitle>Personalized Dashboard</FeatureTitle>
                                <FeatureDescription>View your calorie progress and get personalized health insights.</FeatureDescription>
                            </Feature>
                            <Feature>
                                <Icon>🔥</Icon>
                                <FeatureTitle>Goal-Oriented</FeatureTitle>
                                <FeatureDescription>Set your health goals and let MealMate guide you to achieve them.</FeatureDescription>
                            </Feature>
                        </Features>
                        <Buttons>
                            <Button onClick={() => navigate('/signup')}>Start Today !</Button>
                            <ButtonSecondary onClick={() => navigate('/login')}>Already Have an Account ? Log In</ButtonSecondary>
                        </Buttons>
                    </Content>
                </Overlay>
            </Main>
            <Footer>
                <Credits>
                    <p>
                        <a href="https://www.flaticon.com/free-icons/logout" title="logout icons">Logout icons created by Gregor Cresnar - Flaticon</a>
                    </p>
                    <p>
                        <a href="https://www.vecteezy.com/free-vector/healthy-food-background">Healthy Food Background Vectors by Vecteezy</a>
                    </p>
                </Credits>
            </Footer>
        </>
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

const Overlay = styled.div`
    width: 100%;
    padding: 3rem;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Content = styled.div`
    max-width: 900px;
    background: rgba(255, 255, 255, 0.99);
    padding: 3rem;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h1`
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
    color: #f2c14e;
    font-weight: 700; 
`;

const Subtitle = styled.h2`
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: #F78154;
    font-weight: 500; 
`;

const Description = styled.p`
    font-size: 1.2rem;
    margin-bottom: 2.5rem;
    color: black;
    font-weight: 400; 
`;

const Features = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 3rem;
`;

const Feature = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 150px;
`;

const Icon = styled.div`
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
    color: #B4436C;
`;

const FeatureTitle = styled.h3`
    font-size: 1.4rem;
    margin-bottom: 0.75rem;
    color: #f2c14e;
    font-weight: 600; 
`;

const FeatureDescription = styled.p`
    font-size: 1rem;
    text-align: center;
    color: black;
`;

const Buttons = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem; 
`;

const Button = styled.button`
    padding: 1rem 2.5rem; 
    font-size: 1.2rem; 
    color: #fff;
    background-color: #4D9078;
    border: none;
    border-radius: 8px; 
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;

    &:hover {
        background-color: #3c7460;
        transform: scale(1.05); 
    }
`;

const ButtonSecondary = styled(Button)`
    background-color: #B4436C;

    &:hover {
        background-color: #93345a;
        transform: scale(1.05);
    }
`;

const Footer = styled.footer`
    background-color: white;
    padding: 1rem;
    text-align: center;
    width: 100%;
`;

const Credits = styled.div`
    font-size: 0.9rem;
    color: black;
    a {
        color: black;
        text-decoration: none;
        transition: color 0.3s;
    }

    a:hover {
        color: #5fad56; 
    }
`;
