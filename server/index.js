const express = require("express");
const morgan = require("morgan");
const cors = require('cors');

const PORT = 3000;

const { signup, login, getUserDashboard, searchRecipes, addMeal, deleteMeal, getUserProfile, updateUserProfile, changePassword, getMealsByRange } = require("./handlers");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

app.post('/signup', signup);
app.post('/login', login);
app.get('/dashboard/:name', getUserDashboard);
app.get('/search', searchRecipes);
app.post('/add', addMeal);
app.delete('/delete/:recipeId', deleteMeal);
app.get('/profile/:id', getUserProfile);
app.put('/profile/update', updateUserProfile);
app.put('/profile/change-password', changePassword)
app.get('/dashboard/:name/range', getMealsByRange);

// 404 for handling undefined routes
app.use('*', (req, res) => {
    res.status(404).json({ status: 404, message: "This isn't the endpoint you're looking for!" });
});

app.listen(PORT, () => {
    console.log("Server listening on port", PORT);
});