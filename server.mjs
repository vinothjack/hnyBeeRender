import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import productRoutes from './routes/productRoutes.mjs'; 
import authRoutes from './routes/authRoutes.mjs';   
import { errorMiddleware } from './middleware/errorMiddleware.mjs'; 
import dotenv from 'dotenv';


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
dotenv.config();



const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://vinoth19rfc:Linux-199219@cluster0.frymi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

connectDB();




app.use('/api/product', productRoutes); 
app.use('/api/auth', authRoutes);    


app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
