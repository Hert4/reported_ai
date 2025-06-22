import express from 'express'
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from './database/connectDB.js';
import userRoutes from "./routes/userRoutes.js";

const app = express()
const PORT = process.env.PORT || 5000;

dotenv.config();


connectDB()

app.use(express.json({ limit: '50mb' })); // Increase size limit to 50mb
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// middleware simple just a function run between request and response
app.use(express.json()); // parse json data in the req.body
app.use(express.urlencoded({ extended: true })); // parse form data in the req.body
app.use(cookieParser()); // parse cookies in the req.headers

app.use('/api/users', userRoutes)

app.listen(PORT, () => {
  console.log(`server start at http://localhost:${PORT} yay!`)
})