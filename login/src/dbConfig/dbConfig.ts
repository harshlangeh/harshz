import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

export async function connect() {
    try {
        // Ensure MONGO_URI is defined
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in .env");
        }

        // Check if already connected
        if (mongoose.connection.readyState === 1) {
            console.log("Already connected to MongoDB");
            return;
        }

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected Successfully");

        // Add event listeners only once
        mongoose.connection.once("error", (err) => {
            console.error("MongoDB connection error:", err);
        });

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error connecting to MongoDB:", error.message);
        } else {
            console.error("Unexpected error connecting to MongoDB:", error);
        }
        throw new Error("Database connection failed");
    }
}

























// import mongoose from "mongoose";

// export async function connect() {
//     try {
//         mongoose.connect(process.env.MONGO_URI!);
//         const connection = mongoose.connection ;


//         connection.on('connected', () => {
//              console.log("MongoDB Connected Successfully")
//         })

//         connection.on('error', (err)=> {
//             console.log("MongoDB connection error. Please make sure mongodb is running." + err)
//         })

//     } catch (error) {
//         console.log("something went wrong")
//         console.log(error)
//     }
// }