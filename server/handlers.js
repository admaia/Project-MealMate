const { v4: uuidv4 } = require('uuid');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const axios = require('axios');
const crypto = require('crypto');

require('dotenv').config();
const { MONGO_URI, FATSECRET_USER_KEY, FATSECRET_USER_SECRET } = process.env;

const DB = 'MealMate';
const USER_COLLECTION = 'users';
const MEAL_COLLECTION = 'meals';
const {createProfile} = require("./dbCreation")

const signup = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) { 
        return res.status(400).json({ status: 400, message: 'Please provide your name, email, and password.' });
    }

    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB);
        console.log('Connected to database');
        
        const existingUser = await db.collection(USER_COLLECTION).findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 400, message: 'User already exists' });
        }

        const cryptedPassword = await bcrypt.hash(password, 10);
        const newUserId = uuidv4();
        const result = await db.collection(USER_COLLECTION).insertOne({
            _id: newUserId,
            name,
            email,
            password: cryptedPassword,
        });
        console.log('User inserted:', result);

        if (result.acknowledged) {
            try {
                await createProfile(newUserId);
            } catch (error) {
                console.error('Error creating profile on FatSecret:', error);
            }
            const newUser = await db.collection(USER_COLLECTION).findOne({ _id: newUserId });
            console.log('New user fetched:', newUser);
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
        console.error('Error during signup:', error);
        res.status(502).json({ status: 502, message: error.message });
    } finally {
        await client.close();
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ status: 400, message: 'Please provide email and password.' });
    }

    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB);
        const foundUser = await db.collection(USER_COLLECTION).findOne({ email });

        if (!foundUser) {
            return res.status(404).json({ status: 404, message: 'Invalid email.' });
        }

        if (!foundUser.password) {
            return res.status(500).json({ status: 500, message: 'No password found for this user.' });
        }

        const match = await bcrypt.compare(password, foundUser.password);

        if (!match) {
            return res.status(401).json({ status: 401, message: 'Invalid password.' });
        }

        try {
            await createProfile(foundUser._id);
        } catch (error) {
            console.error('Error creating profile on FatSecret:', error);
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
        res.status(500).json({ status: 500, message: 'Server error' });
    } finally {
        await client.close();
    }
};

const getUserDashboard = async (req, res) => {
    const client = new MongoClient(MONGO_URI);
    const { name } = req.params;
    const { date } = req.query;

    console.log(`Received request: name=${name}, date=${date}`);

    if (!date) {
        return res.status(400).json({ status: 400, message: 'Date is required' });
    }

    if (!req.session || !req.session.userId) {
        return res.status(401).json({ status: 401, message: 'Not authenticated' });
    }

    try {
        await client.connect();
        const db = client.db(DB);
        const user = await db.collection(USER_COLLECTION).findOne({ _id: req.session.userId });

        if (!user) {
            return res.status(403).json({ status: 403, message: 'User not found' });
        }

        if (user.name !== name) {
            return res.status(403).json({ status: 403, message: 'Forbidden' });
        }

        // Convert date to start and end of the day in UTC
        const startOfDay = new Date(`${date}T00:00:00Z`);
        const endOfDay = new Date(`${date}T23:59:59Z`);

        console.log('Start of Day:', startOfDay.toISOString());
        console.log('End of Day:', endOfDay.toISOString());

        const meals = await db.collection(MEAL_COLLECTION)
            .find({
                userId: req.session.userId,
                addedDate: { $gte: startOfDay, $lte: endOfDay }
            })
            .toArray();

        console.log('Fetched meals:', meals);

        res.json({ meals });
    } catch (error) {
        console.error('Error during dashboard access:', error);
        res.status(500).json({ status: 500, message: 'Error' });
    } finally {
        await client.close();
    }
};

const encodeParams = (params) => {
    return Object.entries(params)
        .sort()
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
};

const generateOAuthSignature = (httpMethod, url, params, consumerSecret) => {
    const encodedParams = encodeParams(params);
    const baseString = `${httpMethod.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(encodedParams)}`;
    const signingKey = `${encodeURIComponent(consumerSecret)}&`;
    return crypto.createHmac('sha1', signingKey)
        .update(baseString)
        .digest('base64');
};

const searchRecipes = async (req, res) => {
    if (!req.query.query) {
        return res.status(400).json({ error: 'no query' });
    }

    const method = 'recipes.search.v3';
    const url = 'https://platform.fatsecret.com/rest/server.api';
    const params = {
        method,
        search_expression: req.query.query,
        format: 'json',
        max_results: req.query.max_results || 20,
        page_number: req.query.page_number || 0,
        oauth_consumer_key: FATSECRET_USER_KEY,
        oauth_nonce: uuidv4(),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000),
        oauth_version: '1.0'
    };

    params.oauth_signature = generateOAuthSignature('GET', url, params, FATSECRET_USER_SECRET);
    console.log('params.oauth_signature', params.oauth_signature);
    try {
        const response = await axios.get(url, { params });
        const recipes = response.data.recipes?.recipe || [];
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
            total_results: response.data.recipes?.total_results || 0
        });
    } catch (error) {
        console.error('Error searching recipes:', error.response?.data || error.message || error);
        res.status(500).send('Error searching recipes');
    }
};

const addMeal = async (req, res) => {
    const { userId, recipeId } = req.body;
    const client = new MongoClient(MONGO_URI);

    const url = 'https://platform.fatsecret.com/rest/server.api';
    const params = {
        method: 'recipe.get.v2',
        recipe_id: recipeId,
        format: 'json',
        oauth_consumer_key: FATSECRET_USER_KEY,
        oauth_nonce: uuidv4(),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000),
        oauth_version: '1.0'
    };

    params.oauth_signature = generateOAuthSignature('GET', url, params, FATSECRET_USER_SECRET);

    try {
        // Fetch the recipe data
        const recipeResponse = await axios.get(url, { params });
        console.log('Recipe response:', recipeResponse.data);

        const recipe = recipeResponse.data.recipe;

        // Check if recipe data is present
        if (!recipe || !recipe.serving_sizes || !recipe.serving_sizes.serving) {
            console.error('Incomplete recipe data:', recipe);
            throw new Error('Incomplete recipe data');
        }

        const serving = recipe.serving_sizes.serving;
        const calories = serving.calories || 'N/A';
        const fat = serving.fat || 'N/A';
        const protein = serving.protein || 'N/A';
        const carbohydrate = serving.carbohydrate || 'N/A';
        const imageUrl = (recipe.recipe_images && recipe.recipe_images.recipe_image && recipe.recipe_images.recipe_image[0]) || 'default-image-url';

        console.log('Parsed meal data:', {
            recipeName: recipe.recipe_name,
            recipeDescription: recipe.recipe_description,
            calories,
            fat,
            protein,
            carbohydrate,
            imageUrl
        });

        // Save meal data to your local database
        await client.connect();
        const db = client.db(DB);
        const collection = db.collection(MEAL_COLLECTION);
        const mealData = {
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
        };
        const result = await collection.insertOne(mealData);
        console.log('Meal added to database:', result);

        // Update user's total calorie count
        const userCollection = db.collection(USER_COLLECTION);
        await userCollection.updateOne(
            { _id: userId },
            { $inc: { totalCalories: parseFloat(calories) } } // Adjust the field based on your schema
        );

        res.status(201).json({ status: 201, message: 'Meal added successfully', meal: mealData });
    } catch (error) {
        console.error('Error adding meal:', error.response?.data || error.message || error);
        res.status(500).json({
            status: 500,
            message: 'Error adding meal',
            error: error.response?.data || error.message
        });
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

const getUserProfile = async (req, res) => {
    const { id } = req.params;
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB);
        const user = await db.collection(USER_COLLECTION).findOne({ _id: id });
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ status: 500, message: 'Internal server error' });
    } finally {
        await client.close();
    }
};

const updateUserProfile = async (req, res) => {
    const { userId, name } = req.body;
    if (!userId || !name) {
        return res.status(400).json({ status: 400, message: 'User ID and name are required' });
    }
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB);
        const result = await db.collection(USER_COLLECTION).updateOne(
            { _id: userId },
            { $set: { name } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }
        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ status: 500, message: 'Internal server error' });
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
    deleteMeal,
    getUserProfile,
    updateUserProfile
};