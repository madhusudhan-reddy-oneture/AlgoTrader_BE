import mongoose from "mongoose";

export async function connectDB() {
    try {
        mongoose.set('strictQuery', true);
        const dbURI = process.env.MONGO_URI || "mongodb://localhost:27017/algotrader";

        await mongoose.connect(dbURI, {
            autoIndex: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error);
        process.exit(1);
    }
}