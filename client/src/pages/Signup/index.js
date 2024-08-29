import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { LoggedInUserContext } from '../../contexts/LoggedInUserContext';

const Signup = () => {
    const { logIn } = useContext(LoggedInUserContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [initialPassword, setPassword] = useState('');
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
                body: JSON.stringify({ name, email, initialPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                logIn(data); 
                navigate(`/dashboard/${data.user.name}`);
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
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    type="name"
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
                    value={initialPassword}
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