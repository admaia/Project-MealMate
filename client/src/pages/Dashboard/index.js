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
                        max_results: 20,
                        page_number: 2
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
                <span>{selectedDate.slice(-2)}</span>
                <button className='meal-button' onClick={() => handleDateChange('next')}>&gt;</button>
            </DateSelector>
            <SummarySection>
                <MacroItemCal>
                    <label>Total Calories</label>
                    <span>{totalCalories} kcal</span>
                </MacroItemCal>
                <MacroItemFat>
                    <label>Fat</label>
                    <span>{totalFat}g</span>
                </MacroItemFat>
                <MacroItemPro>
                    <label>Protein</label>
                    <span>{totalProtein}g</span>
                </MacroItemPro>
                <MacroItemCarb>
                    <label>Carbohydrates</label>
                    <span>{totalCarbohydrate}g</span>
                </MacroItemCarb>
            </SummarySection>
            <MainContentWrapper>
                <ContentWrapper>
                    <SectionMeals>
                        <h3>Your Meals</h3>
                        <MealsList>
                            {meals.length === 0 ? (
                                <div>No meals added to your dashboard yet</div>
                            ) : (
                                meals.map(meal => (
                                    <MealItem key={meal._id}>
                                        <h4>{meal.recipeName}</h4>
                                        <p className='meal-calories'>{meal.calories} kcal</p>
                                        <p className='meal-fat'>{meal.fat} g</p>
                                        <p className='meal-protein'>{meal.protein} g</p>
                                        <p className='meal-carb'>{meal.carbohydrate} g</p>
                                        <button className='meal-button' onClick={() => deleteMeal(meal._id)}>-</button>
                                    </MealItem>
                                ))
                            )}
                        </MealsList>
                    </SectionMeals>
                    <SectionCharts>
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
                                    tick={{ fontSize: 14, fontWeight: 'bold' }}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tick={false} 
                                />
                                <Tooltip />
                                <Line type="monotone" dataKey="calories" stroke="#5fad56" />
                            </LineChart>
                        </ChartContainer>
                    </SectionCharts>
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
    transition: margin-left 0.3s ease; 

    @media (max-width: 768px) {
        margin-left: 180px; 
    }

    @media (max-width: 480px) {
        margin-left: 0;
        padding: 1rem;
    }
`;

const SummarySection = styled.div`
    display: flex;
    justify-content: flex-start; 
    flex-wrap: wrap;
    gap: 2rem; 
    margin-top: 5px;

    @media (max-width: 768px) {
        gap: 0.5rem; 
        flex-wrap: wrap; 
    }

    @media (max-width: 480px) {
        gap: 0.5rem; 
        flex-wrap: wrap; 
    }
`;

const MacroItemCal = styled.div`
    background: rgba(242, 193, 78, 0.95);
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    flex: 1 1 150px;
    display: flex;
    flex-direction: column;
    align-items: center;

    @media (max-width: 768px) {
        font-size: 1.2rem;
        padding: 0.75rem; 
    }

    @media (max-width: 480px) {
        font-size: 0.8rem;
        padding: 0.75rem; 
    }
`;

const MacroItemFat = styled(MacroItemCal)`
    background: rgba(247, 129, 84, 0.95);
`;

const MacroItemPro = styled(MacroItemCal)`
    background: rgba(77, 144, 120, 0.95);
`;

const MacroItemCarb = styled(MacroItemCal)`
    background: rgba(180, 67, 108, 0.95);
`;

const MainContentWrapper = styled.div`
    display: flex;
    flex: 1;
    gap: 7rem;
    margin-top: 1rem;
    flex-wrap: wrap;
    transition: width 0.3s ease; 

    @media (max-width: 768px) {
        width: calc(100% - 80px);
        gap: 0.5rem;
    }
    @media (max-width: 480px) {
        width: calc(100% - 25px);
        gap: 0.5rem;
    }
`;

const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%; 
`;

const Section = styled.section`
    background: rgba(255, 255, 255, 0.97);
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    flex: 1;
    overflow: auto;
    margin-bottom: 20px;
    width: 100%;
    max-width: 100%;
    max-height: 900px;

    @media (max-width: 768px) {
        font-size: 1.2rem;
        max-width: 100%; 
        max-height: 350px;
    }
    @media (max-width: 480px) {
        font-size: 1rem;
        padding: 0.75rem; 
        max-height: 250px;
    }
`;

const SectionMeals = styled(Section)`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    max-height: 400px;
`;

const SectionCharts = styled(Section)`
    max-height: 400px;
`;

const SearchBar = styled.div`
    margin-bottom: 1rem;

    @media (max-width: 768px) {
            font-size: 1rem; 
            padding: 0.4rem; 
    }
    @media (max-width: 480px) {
            font-size: 0.8rem; 
            padding: 0.4rem; 
    }
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

    @media (max-width: 768px) {
        button {
            font-size: 1.5rem; 
            padding: 0 0.25rem; 
        }
        span {
            font-size: 1rem;
        }
    }

    @media (max-width: 480px) {
        padding-top: 3rem;
        button {
            font-size: 1rem; 
            padding: 0 0.25rem; 
        }
        span {
            font-size: 0.9rem;
        }
    }
`;

const MealsList = styled.ul`
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem; 
    overflow-y: auto;
    max-height: calc(100% - 60px);

    @media (max-width: 480px) {
        max-height: calc(100% - 20px);
    }
`;

const MealItem = styled.li`
    background: #f2f2f2;
    border: solid 2px #f2f2f2;
    padding: 1rem;
    border-radius: 12px;
    display: flex;
    flex-direction: row; 
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem; 
    width: 100%;
    box-sizing: border-box; 
    font-size: 1rem; 
    
    h4 {
        margin: 0;
        font-size: 1.1rem; 
    }

    p {
        margin: 0;
    }

    @media (max-width: 768px) {
        max-height: 150px;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    @media (max-width: 480px) {
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
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
    width: 100%;
    max-width: 100%;
`;
