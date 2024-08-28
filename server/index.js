const express = require("express");
const morgan = require("morgan");

const PORT = 3000;

const {
} = require("./handlers");

const app = express();

app.use(express.json());
app.use(morgan("tiny"));



// 404 for handling undefined routes
app.use('*', (req, res) => {
    res.status(404).json({status: 404, message: "This isn't the endpoint you're looking for!"});
});

app.listen(PORT, () => {
    console.log("Server listening on port ", PORT);
});