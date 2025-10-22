HNG Stage 1: String Analyzer API
A RESTful API built with Node.js, Express, and MongoDB that analyzes properties of a given string and stores the results.

How to Run Locally
Prerequisites
Node.js
MongoDB (or a MongoDB Atlas account)
1. Clone the Repository
bash
git clone https://github.com/olamilekanmacaulay/String-analyzer-api-hng13.git
cd String-analyzer-api-hng13
2. Install Dependencies
bash
npm install
3. Set Up Environment Variables
Create a .env file in the root of the project:

env
MONGO_URI=mongodb+srv://Maclek:Nov152000@cluster0.lom62ug.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
PORT=8000


4. Start the Server
bash
npm run dev
The server will run on https://string-analyzer-api-hng13.fly.dev/

Dependencies
bash
npm install express mongoose dotenv cors
Environment Variables
Variable	Description	Required
MONGO_URI	MongoDB connection string	Yes
PORT	Server port number	No (defaults to 8080)


