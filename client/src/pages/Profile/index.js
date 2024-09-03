import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { LoggedInUserContext } from '../../contexts/LoggedInUserContext';
import styled from 'styled-components';

const Profile = () => {
    const { loggedInUser, updateUserProfile } = useContext(LoggedInUserContext);
    const [userData, setUserData] = useState({
        name: '',
    });
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (loggedInUser && loggedInUser._id) {
            axios.get(`/profile/${loggedInUser._id}`)
                .then(res => {
                    const { name } = res.data;
                    setUserData({ name });
                })
                .catch(error => {
                    console.error('Error fetching user data:', error);
                });
        }
    }, [loggedInUser]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/profile/update', {
                userId: loggedInUser._id,
                name: userData.name,
            });
            setMessage('Profile updated successfully!');
            setError('');
            updateUserProfile({ ...loggedInUser, name: userData.name });
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Error updating profile.');
            setMessage('');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/profile/change-password', {
                userId: loggedInUser._id,
                newPassword: password,
            });
            setMessage('Password changed successfully!');
            setError('');
            setPassword('');
        } catch (error) {
            console.error('Error changing password:', error);
            setError('Error changing password.');
            setMessage('');
        }
    };

    return (
        <ProfileWrapper>
            <FormSection>
                <Title>Manage Your Profile</Title>
                {message && <Message>{message}</Message>}
                {error && <Error>{error}</Error>}
                <ProfileForm onSubmit={handleUpdateProfile}>
                    <FormGroup>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            type="text"
                            id="name"
                            value={userData.name}
                            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                            required
                        />
                    </FormGroup>
                    <Button type="submit">Update Profile</Button>
                </ProfileForm>
                <PasswordForm onSubmit={handleChangePassword}>
                    <FormGroup>
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </FormGroup>
                    <Button type="submit">Change Password</Button>
                </PasswordForm>
            </FormSection>
        </ProfileWrapper>
    );
};

export default Profile;

const ProfileWrapper = styled.main`
    min-height: calc(100vh - 2.5rem);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    margin-left: 200px; 
    width: calc(100% - 200px); 
    
    @media (max-width: 768px) {
        margin-left: 200px; 
        width: calc(100% - 250px);
        padding: 1rem;
    }

    @media (max-width: 480px) {
        margin-left: 0;
        width: 95%;
        padding: 0.5rem;
    }
`;

const FormSection = styled.div`
    background: rgba(255, 255, 255, 0.95);
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    
    @media (max-width: 768px) {
        padding: 1.5rem;
    }

    @media (max-width: 480px) {
        padding: 1rem;
    }
`;

const Title = styled.h1`
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    color: #f2c14e;
    font-weight: 700;
    text-align: center;
    
    @media (max-width: 768px) {
        font-size: 2rem;
        margin-bottom: 1rem;
    }

    @media (max-width: 480px) {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
    }
`;

const ProfileForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const PasswordForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    font-size: 1rem;
    color: #333;
`;

const Input = styled.input`
    width: 92%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 1rem;
    
    @media (max-width: 768px) {
        padding: 0.5rem;
        font-size: 0.9rem;
    }

    @media (max-width: 480px) {
        padding: 0.4rem;
        font-size: 0.8rem;
    }
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
    
    @media (max-width: 768px) {
        font-size: 1rem;
        padding: 0.5rem;
    }

    @media (max-width: 480px) {
        font-size: 0.9rem;
        padding: 0.4rem;
    }
`;

const Message = styled.div`
    color: green;
    margin-bottom: 1rem;
    text-align: center;
`;

const Error = styled.div`
    color: red;
    margin-bottom: 1rem;
    text-align: center;
`;
