import express from 'express';
import cors from 'cors'; // Add this import
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import { authenticateJWT } from './middleware/auth';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// Use JSON parsing middleware
app.use(express.json());

// MongoDB connection URI
const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('MONGODB_URI is not defined in the environment variables');
    process.exit(1);
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectToDatabase() {
    try {
        // Connect the client to the server
        await client.connect();
        console.log("Connected successfully to MongoDB");

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

// Connect to the database before starting the server
connectToDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
});

// New route to create or update user
app.post('/api/user', async (req, res) => {
    try {
        const { email, name, image } = req.body;
        const database = client.db("ClearCasa");
        const collection = database.collection("users");

        const result = await collection.findOneAndUpdate(
            { email },
            {
                $set: {
                    name,
                    image,
                    lastLogin: new Date()
                },
                $setOnInsert: {
                    googleId: req.body.sub, // Store Google ID, but don't use as primary identifier
                    createdAt: new Date()
                }
            },
            {
                upsert: true,
                returnDocument: 'after'
            }
        );

        if (result.value) {
            res.json({
                message: "User created or updated successfully",
                userId: result.value._id,
                isNewUser: result.lastErrorObject?.upserted ? true : false
            });
        } else {
            res.status(500).json({ error: "Failed to create or update user" });
        }
    } catch (error) {
        console.error("Error in /api/user route:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Protected route example
app.get('/api/protected', authenticateJWT, async (req, res) => {
    try {
        const database = client.db("your_database_name");
        const collection = database.collection("users");

        const result = await collection.find({}).toArray();
        res.json(result);
    } catch (error) {
        console.error("Error in /api/protected route:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});