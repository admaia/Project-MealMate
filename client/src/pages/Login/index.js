import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoggedInUserContext } from '../../contexts/LoggedInUserContext';
import styled from 'styled-components';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { logIn } = useContext(LoggedInUserContext);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const user = await logIn({ email, password });
            if (user && user.name) {
                console.log(`/dashboard/${user.name}`)
                navigate(`/dashboard/${user.name}`);
            } else {
                setError('Invalid user data');
            }
        } catch (err) {
            setError('Failed to log in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Main>
            <Form onSubmit={handleSubmit}>
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
                    {loading ? 'Logging in...' : 'Log In'}
                </Button>
                {error && <Error>{error}</Error>}
            </Form>
        </Main>
    );
};

export default Login;

const Main = styled.main`
    min-height: calc(100vh - 2.5rem);
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Form = styled.form`
    background: rgba(255, 255, 255, 0.8);
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Label = styled.label`
    display: block;
    margin-bottom: 1rem;
`;

const Input = styled.input`
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
`;

const Button = styled.button`
    width: 100%;
    padding: 0.5rem;
    background-color: orangered;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    &:hover {
        background-color: orange;
    }
    &:disabled {
        background-color: #a0a0a0;
        cursor: not-allowed;
    }
`;

const Error = styled.p`
    color: red;
    margin-top: 1rem;
`;