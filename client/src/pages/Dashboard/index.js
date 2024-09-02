import React, { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { LoggedInUserContext } from '../../contexts/LoggedInUserContext';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

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
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (loggedInUser && loggedInUser.name) {
            axios.get(`/dashboard/${loggedInUser.name}?date=${selectedDate}`)
                .then(res => {
                    const fetchedMeals = res.data.meals || [];
                    setMeals(fetchedMeals);
                    calculateTotals(fetchedMeals);
                })
                .catch(error => {
                    console.error('Error fetching meals:', error);
                    setMeals([]);
                });

            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 6);

            axios.get(`/dashboard/${loggedInUser.name}/range`, {
                params: {
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0]
                }
            })
            .then(res => {
                const fetchedMeals = res.data.meals || [];
                const dateCaloriesMap = {};

                fetchedMeals.forEach(meal => {
                    const date = meal.addedDate.split('T')[0];
                    const calories = parseInt(meal.calories) || 0;
                    if (!dateCaloriesMap[date]) {
                        dateCaloriesMap[date] = 0;
                    }
                    dateCaloriesMap[date] += calories;
                });

                const data = [];
                for (let i = 6; i >= 0; i--) {
                    const day = new Date();
                    day.setDate(day.getDate() - i);
                    const dateStr = day.toISOString().split('T')[0];
                    data.push({
                        date: dateStr,
                        calories: dateCaloriesMap[dateStr] || 0
                    });
                }

                setChartData(data);
            })
            .catch(error => {
                console.error('Error fetching chart data:', error);
            });
        }
    }, [loggedInUser, selectedDate]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }

        const handleSearch = async () => {
            try {
                const response = await axios.get('/search', {
                    params: {
                        query: searchQuery,
                        max_results: 10,
                        page_number: 0
                    }
                });
                setSearchResults(response.data.recipes || []);
            } catch (error) {
                console.error('Error searching recipes:', error);
                setSearchResults([]);
            }
        };

        handleSearch();
    }, [searchQuery]);

    const calculateTotals = (meals) => {
        const calories = meals.reduce((sum, meal) => sum + (parseFloat(meal.calories) || 0), 0);
        const fat = meals.reduce((sum, meal) => sum + (parseFloat(meal.fat) || 0), 0);
        const protein = meals.reduce((sum, meal) => sum + (parseFloat(meal.protein) || 0), 0);
        const carbohydrate = meals.reduce((sum, meal) => sum + (parseFloat(meal.carbohydrate) || 0), 0);

        setTotalCalories(Math.round(calories));
        setTotalFat(Math.round(fat));
        setTotalProtein(Math.round(protein));
        setTotalCarbohydrate(Math.round(carbohydrate));
    };

    const addMealToDashboard = (recipe) => {
        const addedDate = selectedDate;
        axios.post('/add', {
            userId: loggedInUser._id,
            recipeId: recipe.recipe_id,
            addedDate: addedDate
        })
        .then(res => {
            if (res.data && res.data.meal) {
                const newMeal = res.data.meal;
                setMeals(prevMeals => {
                    const updatedMeals = [...prevMeals, newMeal];
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
        axios.delete(`/delete/${recipeId}`)
            .then(res => {
                if (res.data && res.data.status === 200) {
                    setMeals(prevMeals => {
                        const updatedMeals = prevMeals.filter(meal => meal._id !== recipeId);
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
        const currentDate = new Date(selectedDate);
        if (direction === 'previous') {
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (direction === 'next') {
            currentDate.setDate(currentDate.getDate() + 1);
        }
        const newDate = currentDate.toISOString().split('T')[0];
        setSelectedDate(newDate);
    };

    return (
        <DashboardWrapper>
            <DateSelector>
                <button className='meal-button' onClick={() => handleDateChange('previous')}>&lt;</button>
                <span>{selectedDate}</span>
                <button className='meal-button' onClick={() => handleDateChange('next')}>&gt;</button>
            </DateSelector>
            <SummarySection>
                <MacroItem>
                    <label>Total Calories</label>
                    <span>{totalCalories} kcal</span>
                </MacroItem>
                <MacroItem>
                    <label>Fat</label>
                    <span>{totalFat}g</span>
                </MacroItem>
                <MacroItem>
                    <label>Protein</label>
                    <span>{totalProtein}g</span>
                </MacroItem>
                <MacroItem>
                    <label>Carbohydrates</label>
                    <span>{totalCarbohydrate}g</span>
                </MacroItem>
            </SummarySection>
            <MainContentWrapper>
                <ContentWrapper>
                    <Section>
                        <h3>Your Meals</h3>
                        <MealsList>
                            {meals.length === 0 ? (
                                <div>No meals added to your dashboard yet</div>
                            ) : (
                                meals.map(meal => (
                                    <MealItem key={meal._id}>
                                        <h4>{meal.recipeName}</h4>
                                        <p>{meal.calories} kcal</p>
                                        <p>{meal.fat} g</p>
                                        <p>{meal.protein} g</p>
                                        <p>{meal.carbohydrate} g</p>
                                        <button className='meal-button' onClick={() => deleteMeal(meal._id)}>-</button>
                                    </MealItem>
                                ))
                            )}
                        </MealsList>
                    </Section>
                    <ChartSection>
                        <h3>Calories Intake Overview</h3>
                        <ChartContainer>
                            <LineChart width={600} height={300} data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => {
                                        const dateObj = new Date(date);
                                        dateObj.setDate(dateObj.getDate() + 1);
                                        return dateObj.getDate();
                                    }}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tick={false} 
                                />
                                <Tooltip />
                                <Line type="monotone" dataKey="calories" stroke="#8884d8" />
                            </LineChart>
                        </ChartContainer>
                    </ChartSection>
                </ContentWrapper>
                <Section>
                    <h3>Search Recipes</h3>
                    <SearchBar>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search recipes"
                        />
                    </SearchBar>
                    <h3>Search Results</h3>
                    <MealsList>
                        {searchResults.length === 0 ? (
                            <div>No results found</div>
                        ) : (
                            searchResults.map(recipe => (
                                <MealItem key={recipe.recipe_id}>
                                    <h4>{recipe.recipe_name}</h4>
                                    <button className='meal-button' onClick={() => addMealToDashboard(recipe)}>+</button>
                                </MealItem>
                            ))
                        )}
                    </MealsList>
                </Section>
            </MainContentWrapper>
        </DashboardWrapper>
    );
};

export default Dashboard;

const DashboardWrapper = styled.div`
    padding: 2rem;
    display: flex;
    flex-direction: column;
    height: 100vh;
    margin-left: 250px; 
`;

const SummarySection = styled.div`
    display: flex;
    justify-content: flex-start; 
    flex-wrap: wrap;
    gap: 2rem; 
    margin-top: 5px;
    margin-bottom: 1rem;
`;

const MacroItem = styled.div`
    background: rgba(255, 255, 255, 0.97);
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
    width: 150px;
    display: flex;
    flex-direction: column;
    align-items: center; 
`;

const MainContentWrapper = styled.div`
    display: flex;
    flex: 1;
    gap: 2rem;
    margin-top: 2rem;
`;

const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    flex: 2;
`;

const ChartSection = styled.section`
    margin-bottom: 20px;
    background: rgba(255, 255, 255, 0.97);
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
`;

const Section = styled.section`
    background: rgba(255, 255, 255, 0.97);
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
    flex: 1;
    overflow: auto;
    margin-bottom: 20px;
`;

const SearchBar = styled.div`
    margin-bottom: 1rem;
`;

const DateSelector = styled.div`
    font-weight: bold;
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    button {
        font-size: 1.5rem;
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
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem; 
`;

const MealItem = styled.li`
    background: #f2f2f2;
    border: solid 2px #f2f2f2;
    padding: 1rem;
    border-radius: 12px;
    display: flex;
    justify-content: space-between; 
    align-items: center;
    width: 100%;
    box-sizing: border-box; 
    font-size: 1rem; 
    max-height: 80px; 
    
    h4 {
        margin-right: auto;
    }

    p {
        margin: 0 1rem; 
    }

    button {
        margin-left: auto;
    }
`;

const ChartContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid #ccc;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;
