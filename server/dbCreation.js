const fs = require('node:fs');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const OAuth = require('oauth').OAuth;

require('dotenv').config();
const { MONGO_URI, FATSECRET_USER_KEY, FATSECRET_USER_SECRET } = process.env;

const oauth = new OAuth(
    'https://www.fatsecret.com/oauth/request_token',
    'https://www.fatsecret.com/oauth/access_token',
    FATSECRET_USER_KEY,
    FATSECRET_USER_SECRET,
    '1.0',
    null,
    'HMAC-SHA1'
);

const createProfile = (userId) => {
    return new Promise((resolve, reject) => {
        const url = 'https://platform.fatsecret.com/rest/server.api';
        const params = {
            method: 'profile.create',
            user_id: userId,
            format: 'json'
        };
        oauth.get(`${url}?${new URLSearchParams(params).toString()}`, FATSECRET_USER_KEY, FATSECRET_USER_SECRET, (error, data, response) => {
            if (error) {
                console.error('Error:', error);
                reject(error);
            } else {
                try {
                    const profile = JSON.parse(data).profile;
                    resolve(profile);
                } catch (err) {
                    console.error('Error parsing profile data:', err);
                    reject(err);
                }
            }
        });
    });
};

const batchImport = async () => {
    const client = new MongoClient(MONGO_URI);
    const users = [
        { name: 'Ada', email: 'ada@gmail.com', password: await bcrypt.hash('ada12345', 10) },
        { name: 'Rayhan', email: 'rayhan@gmail.com', password: await bcrypt.hash('rayhan12345', 10) },
    ];

    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db('MealMate');
        const userCollection = db.collection('users');
        const mealCollection = db.collection('meals');

        for (let userIndex = 0; userIndex < users.length; userIndex++) {
            const user = users[userIndex];
            user._id = uuidv4();
            try {
                await createProfile(user._id);
                const result = await userCollection.insertOne(user);
                if (result.acknowledged !== true) {
                    console.error(`Error inserting user ${user.name}.`);
                } else {
                    console.log(`New user ${user.name} added.`);
                }
            } catch (err) {
                console.error(`Error creating or inserting new user ${user.name}:`, err);
            }
        }
        
        const sampleMeals = [
            {
                _id: uuidv4(),
                userId: users[0]._id,
                recipeId: 'sample-recipe-id-1',
                recipeName: 'Chicken Salad',
                recipeDescription: 'A healthy chicken salad.',
                calories: 250,
                fat: 10,
                protein: 30,
                carbohydrate: 15,
                imageUrl: 'https://example.com/image1.jpg',
                addedDate: new Date()
            },
            {
                _id: uuidv4(),
                userId: users[1]._id,
                recipeId: 'sample-recipe-id-2',
                recipeName: 'Beef Stir Fry',
                recipeDescription: 'A savory beef stir fry.',
                calories: 400,
                fat: 20,
                protein: 25,
                carbohydrate: 30,
                imageUrl: 'https://example.com/image2.jpg',
                addedDate: new Date()
            }
        ];

        const mealResult = await mealCollection.insertMany(sampleMeals);
        if (mealResult.acknowledged === true) {
            console.log('Sample meals added successfully.');
        } else {
            console.error('Error adding sample meals.');
        }

    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    } finally {
        console.log('Disconnected from MongoDB.');
        await client.close();
    }
};

batchImport();