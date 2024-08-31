import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { LoggedInUserContext } from '../../contexts/LoggedInUserContext';
import styled from 'styled-components';

const Profile = () => {
    const { loggedInUser, logOut, logIn, updateUserProfile } = useContext(LoggedInUserContext);
    const [userData, setUserData] = useState({
        name: '',
        password: '',
    });
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (loggedInUser && loggedInUser._id) {
            axios.get(`/profile/${loggedInUser._id}`)
                .then(res => {
                    const { name } = res.data;
                    setUserData({ name, password: '' });
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
                ...userData,
            });
            setMessage('Profile updated successfully!');
            setError('');

            logOut();
            
            const reLoggedInUser = await logIn({
                username: loggedInUser.username,
                password: loggedInUser.password,
            });

            updateUserProfile(reLoggedInUser);
        } catch (error) {
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
            setError('Error changing password.');
            setMessage('');
        }
    };

    return (
        <ProfileWrapper>
            <h1>Manage Your Profile</h1>
            {message && <Message>{message}</Message>}
            {error && <Error>{error}</Error>}
            <ProfileSection>
                <h2>Profile Information</h2>
                <Form onSubmit={handleUpdateProfile}>
                    <FormGroup>
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={userData.name}
                            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                            required
                        />
                    </FormGroup>
                    <button type="submit">Update Profile</button>
                </Form>
            </ProfileSection>
            <ProfileSection>
                <h2>Change Password</h2>
                <Form onSubmit={handleChangePassword}>
                    <FormGroup>
                        <label htmlFor="password">New Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <button type="submit">Change Password</button>
                </Form>
            </ProfileSection>
        </ProfileWrapper>
    );
};

export default Profile;

const ProfileWrapper = styled.div`
    padding: 2rem;
    max-width: 600px;
    margin: auto;
`;

const ProfileSection = styled.section`
    margin-bottom: 2rem;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 5px;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Message = styled.div`
    color: green;
    margin-bottom: 1rem;
`;

const Error = styled.div`
    color: red;
    margin-bottom: 1rem;
`;