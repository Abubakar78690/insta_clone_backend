import * as dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import bodyParser from 'body-parser'
import userRoutes from './routes/user.js'
import postRoutes from './routes/post.js'
import profileRoutes from './routes/profile.js'
import commentRoutes from './routes/comments.js'
import conversationRoutes from './routes/conversations.js'
import messageRoutes from './routes/messages.js'
import { cloudinaryConfig } from './utils/cloudinary.js'
import { Server } from 'socket.io'
import http from 'http'


const FRONTEND_URL = process.env.FRONTEND_URL;
const app = express()
dotenv.config()
app.use(cors({
    origin: FRONTEND_URL, // <-- Use the variable here
    credentials: true
}));
const server = http.createServer(app)
app.use(bodyParser.json({limit: '5mb'}))
app.use('*', cloudinaryConfig)

export const io = new Server(server, {
    cors: {
        origin: FRONTEND_URL, // <-- Use the variable here
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] // Ensure all methods are allowed for socket
    } 
});


// Function to connect to MongoDB and start the server
const startServer = async () => {
    try {
        // 1. Connect to MongoDB
       // await mongoose.connect(process.env.MONGO_CONNECTION_URL);
        //console.log('Successfully connected to MongoDB cluster');

        // 2. Define the port using the environment variable, or default to 8080
        const port = process.env.PORT || 8080;
        
        // 3. Start the server ONLY AFTER successful DB connection
        server.listen(port, () => {
            // This is the CRITICAL log line Azure needs to see.
            console.log(`Server is Successfully Running on port ${port}`);
        });

    } catch (error) {
        console.error("Failed to connect to MongoDB or start server:", error);
        // Exit the process so Azure knows the app failed and can try restarting
        process.exit(1); 
    }
}

// Ensure database connection handling is outside the server.listen callback
mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB cluster')
})

// *** New Startup Logic: Call the single function to start the entire process ***
startServer();
