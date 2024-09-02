import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { LoggedInUserContext } from '../../contexts/LoggedInUserContext';

const Signup = () => {
    const { logIn } = useContext(LoggedInUserContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();

            if (res.ok) {
                const loginData = await logIn({ email, password });
                navigate(`/dashboard/${loginData.name}`);
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error('Error signing up', err);
            setError('Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Main>
            <Form onSubmit={handleSubmit}>
                <Title>Create an Account</Title>
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                />
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                />
                <Button type="submit" disabled={loading}>
                    {loading ? 'Creating profile...' : 'Sign up'}
                </Button>
                {error && <Error>{error}</Error>}
            </Form>
        </Main>
    );
};

export default Signup;

const Main = styled.main`
    min-height: calc(100vh - 2.5rem);
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Form = styled.form`
    background: rgba(255, 255, 255, 0.95); /* Slightly less transparent */
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    width: 100%;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    color: #f2c14e;
    font-weight: 700;
    text-align: center;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
`;

const Input = styled.input`
    width: 100%;
    padding: 0.75rem;
    margin-bottom: 1.5rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 1rem;
`;

const Button = styled.button`
    width: 100%;
    padding: 0.75rem;
    background-color: #4D9078;
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.1rem;
    transition: background-color 0.3s, transform 0.2s;

    &:hover {
        background-color: #3c7460;
        transform: scale(1.05);
    }

    &:disabled {
        background-color: #a0a0a0;
        cursor: not-allowed;
    }
`;

const Error = styled.p`
    color: red;
    margin-top: 1rem;
    text-align: center;
`;
