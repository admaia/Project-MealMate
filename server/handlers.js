const { v4: uuidv4 } = require('uuid');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const axios = require('axios');

require('dotenv').config();
const { MONGO_URI, FATSECRET_CONSUMER_KEY, FATSECRET_CONSUMER_SECRET } = process.env;

const DB = 'MealMate';
const USER_COLLECTION = 'users';
const MEAL_COLLECTION = 'meals';

if (!MONGO_URI) throw new Error('Your MONGO_URI is missing!');

const signup = async (req, res) => {
    const { name, email, initialPassword } = req.body;
    if (!name || !email || !initialPassword) {
        return res.status(400).json({ status: 400, message: 'Please provide your name, email, and password.' });
    }

    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB);
        const existingUser = await db.collection(USER_COLLECTION).findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 400, message: 'User already exists' });
        }
        const cryptedPassword = await bcrypt.hash(initialPassword, 10);
        const newUserId = uuidv4();
        const result = await db.collection(USER_COLLECTION).insertOne({
            _id: newUserId,
            name,
            email,
            password: cryptedPassword,
        });
        if (result.acknowledged) {
            const newUser = await db.collection(USER_COLLECTION).findOne({ _id: newUserId });
            res.status(201).json({
                status: 201,
                message: 'User created successfully',
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email
                }
            });
        } else {
            res.status(500).json({ status: 500, message: 'Error creating user' });
        }
    } catch (error) {
        console.error(error);
        res.status(502).json({ status: 502, message: error.message });
    } finally {
        await client.close();
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const client = new MongoClient(MONGO_URI);
    try {
        if (!email || !password) {
            return res.status(400).json({ status: 400, message: 'Please enter your email and password.' });
        }
        await client.connect();
        const db = client.db(DB);
        const foundUser = await db.collection(USER_COLLECTION).findOne({ email });
        if (!foundUser) {
            return res.status(404).json({ status: 404, message: "Invalid email." });
        }
        const match = await bcrypt.compare(password, foundUser.password);
        if (!match) {
            return res.status(401).json({ status: 401, message: 'Invalid password.' });
        }
        res.json({
            status: 200,
            message: 'Login successful.',
            user: {
                _id: foundUser._id,
                name: foundUser.name,
                email: foundUser.email
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ status: 500, message: 'Error' });
    } finally {
        await client.close();
    }
};

const getUserDashboard = async (req, res) => {
    const { name } = req.params;
    console.log('Fetching dashboard for:', name);
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB);
        const user = await db.collection(USER_COLLECTION).findOne({ name: name });
        console.log('User found:', user);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }
        const meals = await db.collection(MEAL_COLLECTION).find({ name }).toArray();
        console.log('Meals found:', meals);
        res.json({
            status: 200,
            userDetails: user,
            meals,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: error.message });
    } finally {
        await client.close();
    }
};

const searchRecipes = async (req, res) => {
    try {
        const response = await axios.get('https://platform.fatsecret.com/rest/server.api', {
            params: {
                method: 'recipes.search.v3', 
                search_expression: req.query.query,
                format: 'json',
                oauth_consumer_key: FATSECRET_CONSUMER_KEY,
                oauth_signature: FATSECRET_CONSUMER_SECRET,
                max_results: req.query.max_results || 20,
                page_number: req.query.page_number || 0, 
            }
        });

        const recipes = response.data.recipes.recipe;
        res.json({
            recipes: recipes.map(recipe => ({
                recipe_id: recipe.recipe_id,
                recipe_name: recipe.recipe_name,
                recipe_description: recipe.recipe_description,
                recipe_image: recipe.recipe_image,
                recipe_nutrition: recipe.recipe_nutrition,
                recipe_ingredients: recipe.recipe_ingredients,
                recipe_types: recipe.recipe_types
            })),
            total_results: response.data.recipes.total_results
        });
    } catch (error) {
        console.error('Error searching recipes:', error);
        res.status(500).send('Error searching recipes');
    }
};

const addMeal = async (req, res) => {
    const { userId, recipeId } = req.body;
    const client = new MongoClient(MONGO_URI);
    try {
        const recipeResponse = await axios.get('https://api.fatsecret.com/1.0/recipe.get.v2', {
            params: {
                method: 'recipe.get.v2',
                recipe_id: recipeId,
                format: 'json'
            },
            headers: {
                'Authorization': `Bearer ${process.env.FATSECRET_ACCESS_TOKEN}`
            }
        });
        const recipe = recipeResponse.data.recipe;
        const serving = recipe.serving_sizes.serving;
        const calories = serving.calories;
        const fat = serving.fat;
        const protein = serving.protein;
        const carbohydrate = serving.carbohydrate;
        const imageUrl = recipe.recipe_images.recipe_image[0];
        await client.connect();
        const db = client.db(DB);
        const collection = db.collection(MEAL_COLLECTION);
        const result = await collection.insertOne({
            _id: uuidv4(),
            userId,
            recipeId,
            recipeName: recipe.recipe_name,
            recipeDescription: recipe.recipe_description,
            calories,
            fat,
            protein,
            carbohydrate,
            imageUrl,
            addedDate: new Date()
        });
        res.status(201).json({ status: 201, message: 'Meal added successfully', meal: result.ops[0] });
    } catch (error) {
        console.error('Error adding meal:', error);
        res.status(500).json({ status: 500, message: 'Error adding meal' });
    } finally {
        await client.close();
    }
};

const deleteMeal = async (req, res) => {
    const { recipeId } = req.params;
    if (!recipeId) {
        return res.status(400).json({ status: 400, message: 'Recipe ID is required' });
    }
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB);
        const result = await db.collection(MEAL_COLLECTION).deleteOne({ recipeId });
        if (result.deletedCount === 1) {
            res.status(200).json({ status: 200, message: 'Meal deleted successfully' });
        } else {
            res.status(404).json({ status: 404, message: 'Meal not found' });
        }
    } catch (error) {
        console.error('Error deleting meal:', error);
        res.status(500).json({ status: 500, message: 'Error deleting meal' });
    } finally {
        await client.close();
    }
};

module.exports = {
    signup,
    login,
    getUserDashboard,
    searchRecipes,
    addMeal,
    deleteMeal
};