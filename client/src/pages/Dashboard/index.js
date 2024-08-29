import React, { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { LoggedInUserContext } from '../../contexts/LoggedInUserContext';

const Dashboard = () => {
    const { loggedInUser } = useContext(LoggedInUserContext);
    const [meals, setMeals] = useState([]);
    const [totalCalories, setTotalCalories] = useState(0);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (loggedInUser) {
            axios.get(`/dashboard/${loggedInUser.name}`)
                .then(res => {
                    setMeals(res.data.meals);
                    calculateTotalCalories(res.data.meals);
                })
                .catch(error => console.error('Error fetching meals:', error));
        }
    }, [loggedInUser]);

    const calculateTotalCalories = (meals) => {
        const total = meals.reduce((sum, meal) => sum + meal.calories, 0);
        setTotalCalories(total);
    };

    const handleSearch = async () => {
        try {
            const response = await axios.get('/search', { params: { query: searchQuery } });
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching recipes:', error);
            setSearchResults([]);
        }
    };

    const addMealToDashboard = (recipe) => {
        axios.post('/add', {
            userId: loggedInUser._id,
            recipeId: recipe.recipe_id
        })
            .then(res => {
                setMeals([...meals, res.data.meal]);
                calculateTotalCalories([...meals, res.data.meal]);
            })
            .catch(error => console.error('Error adding meal:', error));
    };

    const deleteMeal = (recipeId) => {
        axios.delete(`/delete/${recipeId}`)
            .then(() => {
                setMeals(meals.filter(meal => meal.recipeId !== recipeId));
                calculateTotalCalories(meals.filter(meal => meal.recipeId !== recipeId));
            })
            .catch(error => console.error('Error deleting meal:', error));
    };

    if (!loggedInUser) {
        return <div>Please log in to view your dashboard.</div>;
    }

    return (
        <>
            <DashboardWrapper>
                <Header>Dashboard</Header>
                <Section>
                    <SearchBar>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search recipes"
                        />
                        <button onClick={handleSearch}>Search</button>
                    </SearchBar>
                    <h2>Total Calories: {totalCalories}</h2>
                </Section>
                <Section>
                    <h3>Search Results</h3>
                    <MealsList>
                        {searchResults.map(recipe => (
                            <MealItem key={recipe.recipe_id}>
                                <h4>{recipe.recipe_name}</h4>
                                <button onClick={() => addMealToDashboard(recipe)}>Add to Dashboard</button>
                            </MealItem>
                        ))}
                    </MealsList>
                </Section>
                <Section>
                    <h3>Your Meals</h3>
                    <MealsList>
                        {meals.map(meal => (
                            <MealItem key={meal._id}>
                                <h4>{meal.recipeName}</h4>
                                <button onClick={() => deleteMeal(meal.recipeId)}>Delete</button>
                            </MealItem>
                        ))}
                    </MealsList>
                </Section>
            </DashboardWrapper>
        </>
    );
};

export default Dashboard;

const DashboardWrapper = styled.div`
    max-width: var(--max-content-width);
    margin: auto;
    padding: 2rem;
    min-height: var(--min-content-height);
    background: var(--mostly-transparent);
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Header = styled.h1`
    color: var(--primary-color);
    font-family: var(--heading-font-family);
`;

const Section = styled.section`
    margin-bottom: 2rem;
`;

const SearchBar = styled.div`
    margin-bottom: 2rem;
    input {
        padding: 0.5rem;
        font-size: 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    button {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        margin-left: 1rem;
        cursor: pointer;
        font-size: 1rem;
    }
`;

const MealsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const MealItem = styled.div`
    background: white;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    h4 {
        margin: 0;
    }
    button {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
    }
`;
