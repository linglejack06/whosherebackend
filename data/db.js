const mongoose = require("mongoose");
require("dotenv").config();

const connectToDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Successfully connected to database")
    } catch (error) {
        console.error("Error connecting: \n " + error);
    }
}

module.exports = connectToDb;
