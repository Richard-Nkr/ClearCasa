import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes';
import casaRoutes from './routes/casaRoutes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clearcasa';

console.log('Attempting to connect to MongoDB...');
console.log(`MongoDB URI: ${MONGODB_URI}`);

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB');
        console.log(`Database name: ${mongoose.connection.name}`);
        console.log(`Host: ${mongoose.connection.host}`);
        console.log(`Port: ${mongoose.connection.port}`);
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        console.error('Error details:', error.message);
        process.exit(1);
    });

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

app.use(cors());
app.use(express.json());

// Use the routes
app.use('/api/user', userRoutes);
app.use('/api/casa', casaRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
