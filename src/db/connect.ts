import mongoose from "mongoose";

export async function connectDB(){
    mongoose.set('strictQuery', true);

    await mongoose.connect("mongodb://127.0.0.1:27017/algotrader", {
        autoIndex: false,
        maxPoolSize: 20
    });

    console.log("MongoDB connected");
}