import mongoose from "mongoose";

const connectDB = async () => {

    if (!process.env.MONGO_URI) {
        console.error("CRITICAL: MONGO_URI is missing in environment variables.");
        process.exit(1);
    }

    try {

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 50,
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
};


mongoose.connection.on('disconnected', () => {
    console.warn('Lost MongoDB connection. Waiting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
    console.log('Reconnected to MongoDB.');
});

export default connectDB;
