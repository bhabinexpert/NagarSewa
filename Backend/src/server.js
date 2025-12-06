import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './db.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res)=>{
    res.send("server is running");
    
})

const PORT = process.env.PORT

const startServer = async () => {
    try {
        await db.connect();
        console.log('Database connection successful');

        app.listen(PORT, () => {
            console.log(`Server is running at port: ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
