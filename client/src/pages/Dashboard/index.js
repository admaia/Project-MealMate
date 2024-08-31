import React, { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { LoggedInUserContext } from '../../contexts/LoggedInUserContext';

const Dashboard = () => {
    const { loggedInUser } = useContext(LoggedInUserContext);
    const [meals, setMeals] = useState([]);
    const [totalCalories, setTotalCalories] = useState(0);
    const [totalFat, setTotalFat] = useState(0);
    const [totalProtein, setTotalProtein] = useState(0);
    const [totalCarbohydrate, setTotalCarbohydrate] = useState(0);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        console.log('Fetching meals for date:', selectedDate);

        if (loggedInUser && loggedInUser.user && loggedInUser.user.name) {
            console.log('Logged in user:', loggedInUser.user.name);

            axios.get(`/dashboard/${loggedInUser.user.name}?date=${selectedDate}`)
                .then(res => {
                    console.log('API response:', res.data);
                    
                    const fetchedMeals = res.data.meals || [];
                    console.log('Fetched meals:', fetchedMeals);

                    setMeals(fetchedMeals);
                    calculateTotals(fetchedMeals);
                })
                .catch(error => {
                    console.error('Error fetching meals:', error);
                    setMeals([]);
                });
        } else {
            console.warn('No logged-in user or user name not available');
        }
    }, [loggedInUser, selectedDate]);

    const calculateTotals = (meals) => {
        console.log('Calculating totals for meals:', meals);

        const calories = meals.reduce((sum, meal) => sum + (parseFloat(meal.calories) || 0), 0);
        const fat = meals.reduce((sum, meal) => sum + (parseFloat(meal.fat) || 0), 0);
        const protein = meals.reduce((sum, meal) => sum + (parseFloat(meal.protein) || 0), 0);
        const carbohydrate = meals.reduce((sum, meal) => sum + (parseFloat(meal.carbohydrate) || 0), 0);

        console.log('Calculated Totals:', { calories, fat, protein, carbohydrate });

        setTotalCalories(Math.round(calories));
        setTotalFat(Math.round(fat));
        setTotalProtein(Math.round(protein));
        setTotalCarbohydrate(Math.round(carbohydrate));
    };

    const handleSearch = async () => {
        console.log('Searching with query:', searchQuery);

        try {
            const response = await axios.get('/search', {
                params: {
                    query: searchQuery,
                    max_results: 10,
                    page_number: 2
                }
            });

            console.log('Search API response:', response.data);
            setSearchResults(response.data.recipes);
        } catch (error) {
            console.error('Error searching recipes:', error);
            setSearchResults([]);
        }
    };

    const addMealToDashboard = (recipe) => {
        console.log('Adding meal to dashboard:', recipe);

        axios.post('/add', {
            userId: loggedInUser._id,
            recipeId: recipe.recipe_id,
            addedDate: new Date().toISOString() 
        })
        .then(res => {
            console.log('Add Meal API Response:', res.data);
            if (res.data && res.data.meal) {
                const newMeal = res.data.meal;
                console.log('New meal added:', newMeal);

                setMeals(prevMeals => {
                    const updatedMeals = [...prevMeals, newMeal];
                    console.log('Updated meals list after adding new meal:', updatedMeals);
                    calculateTotals(updatedMeals);
                    return updatedMeals;
                });
            } else {
                console.error('Unexpected response format:', res.data);
            }
        })
        .catch(error => console.error('Error adding meal:', error.response?.data));
    };

    const deleteMeal = (recipeId) => {
        console.log('Deleting meal with ID:', recipeId);

        axios.delete(`/delete/${recipeId}`)
            .then(res => {
                console.log('Delete Meal API Response:', res.data);
                if (res.data && res.data.status === 200) {
                    setMeals(prevMeals => {
                        const updatedMeals = prevMeals.filter(meal => meal.recipeId !== recipeId);
                        console.log('Meals after deletion:', updatedMeals);
                        calculateTotals(updatedMeals);
                        return updatedMeals;
                    });
                } else {
                    console.error('Unexpected response format:', res.data);
                }
            })
            .catch(error => console.error('Error deleting meal:', error.response?.data));
    };

    const handleDateChange = (direction) => {
        console.log('Current selected date:', selectedDate);
        console.log('Changing date direction:', direction);

        const currentDate = new Date(selectedDate);
        if (direction === 'previous') {
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (direction === 'next') {
            currentDate.setDate(currentDate.getDate() + 1);
        }
        const newDate = currentDate.toISOString().split('T')[0];
        console.log('New selected date:', newDate);
        setSelectedDate(newDate);
    };

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
                    <DateSelector>
                        <button onClick={() => handleDateChange('previous')}>&lt;</button>
                        <span>{selectedDate}</span>
                        <button onClick={() => handleDateChange('next')}>&gt;</button>
                    </DateSelector>
                    <h2>Total Calories: {totalCalories}</h2>
                    <h2>Total Fat: {totalFat}g</h2>
                    <h2>Total Protein: {totalProtein}g</h2>
                    <h2>Total Carbohydrates: {totalCarbohydrate}g</h2>
                </Section>
                <Section>
                    <h3>Search Results</h3>
                    <MealsList>
                        {searchResults.length === 0 ? (
                            <div>No results found</div>
                        ) : (
                            searchResults.map(recipe => (
                                <MealItem key={recipe.recipe_id}>
                                    <h4>{recipe.recipe_name}</h4>
                                    <button onClick={() => addMealToDashboard(recipe)}>Add Meal</button>
                                </MealItem>
                            ))
                        )}
                    </MealsList>
                </Section>
                <Section>
                    <h3>Your Meals</h3>
                    <MealsList>
                        {meals.length === 0 ? (
                            <div>No meals added to your dashboard yet</div>
                        ) : (
                            meals.map(meal => (
                                <MealItem key={meal._id}>
                                    <h4>{meal.recipeName}</h4>
                                    <p>Calories: {meal.calories} kcal</p>
                                    <p>Fat: {meal.fat} g</p>
                                    <p>Protein: {meal.protein} g</p>
                                    <p>Carbohydrates: {meal.carbohydrate} g</p>
                                    <button onClick={() => deleteMeal(meal.recipeId)}>Delete</button>
                                </MealItem>
                            ))
                        )}
                    </MealsList>
                </Section>
            </DashboardWrapper>
        </>
    );
};

export default Dashboard;

const DashboardWrapper = styled.div`
    padding: 2rem;
`;

const Header = styled.h1`
    margin-bottom: 1rem;
`;

const Section = styled.section`
    margin-bottom: 2rem;
`;

const SearchBar = styled.div`
    margin-bottom: 1rem;
`;

const DateSelector = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    button {
        font-size: 1.5rem;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0 1rem;
    }
    span {
        font-size: 1.25rem;
        margin: 0 1rem;
    }
`;

const MealsList = styled.ul`
    list-style-type: none;
    padding: 0;
`;

const MealItem = styled.li`
    margin-bottom: 1rem;
`;