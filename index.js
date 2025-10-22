const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const stringRoutes = require('./routes/string.routes');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/strings', stringRoutes);

// Health check route
app.get('/', (req, res) => {
  res.status(200).send({ message: 'String Analyzer API is running!' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});