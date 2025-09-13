import mongoose from "mongoose";

export const connectDB = async() => {
    try {
        mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log("Error connecting to MongoDb:", error);
    }
}
