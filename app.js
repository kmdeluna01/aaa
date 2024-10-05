const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const mongoURI = "mongodb+srv://kmdeluna01:admin@cluster0.hio4j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const JWT_SECRET="c3967c9d339170035ddbd6eed007a4b3528ec96eacbf774e3261268fdb7f4ac30b63cb1b8b75f10c71239125afebb63cb1b8b75f10c71239125afeb1d42c25d975a768072457c81870f6f8d7452";

mongoose
.connect(mongoURI)
.then(() => {
    console.log("Database Connected");
})
.catch((e) => {
    console.log("Database connection error:", e.message);
});

require("./UserDetails");
const User = mongoose.model("UserInfo");

// Register Route
app.post('/register', async (req, res) => {
    console.log("Request Body:", req.body);
        const { name, email, number, password, password1 } = req.body;

        if (!name || !email || !number || !password || !password1) {
            return res.status(400).json({ message: 'Please fill all fields.' });
        }

        if (password !== password1) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            await User.create({
                name: name,
                email: email,
                number, number,
                password: hashedPassword,
            });
        res.status(201).json({ message: 'User registered successfully' });
    }   catch (error) {
        res.status(500).json({ message: error.message });
    }
    });

// Login Route
app.post('/login', async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password.' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ email: user.email }, JWT_SECRET);
        if(res.status(201)){
            return res.send({ status: "ok", data: token});
        }else{
            return res.send({ error: "error"});
        }
});

app.post("/userdata", async(req,res)=>{
    const {token} = req.body;
    try {
        const user = jwt.verify(token, JWT_SECRET)
        const userEmail = user.email;

        User.findOne({ email: userEmail})
        .then((data)=>{
            return res.send({ status: "ok", data: data});
        });
    } catch (error){
        return res.send({ error: "error"});
    }
})

app.get('/api/user/:id', async (req, res) => {
    const { id } = req.params; // Correctly extracting id from request params
    try {
        const user = await User.findById(id); // Use findById for MongoDB ObjectId
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error.message); // Log the error message for debugging
        res.status(500).send('Server error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
