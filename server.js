// --- FIX 1: Dotenv ko sabse pehle load karein taaki MONGO_URI mil sake ---
require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');

// --- FIX 2 & 3: Galat paths ko theek karein ---
// Aapki file list ke anusaar: 'routesapi.js' aur 'middlewaregeneralerror.js' files hain
const apiRouter = require('./routesapi'); 
const generalErrorMiddleware = require('./middlewaregeneralerror'); 
// 'generalRouter' wali line aur 'routes/general' path hata diya gaya hai, kyunki woh exist nahi karte.

// --- Database Connection ---
// MongoDB connection URL Render ke Environment Variables se aayegi.
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connection successfully!'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    // Agar DB connect na ho, toh server start na karein, jaisa aapke purane code mein tha.
});

// --- Security and Middleware ---
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(helmet()); // Basic security settings
app.use(cors()); // Enable CORS

// --- Routes ---
// Purana code generalRouter use kar raha tha, jise ab apiRouter se badal diya gaya hai.
app.use('/api/v1/auth', apiRouter); 
app.use('/', apiRouter); // Aapki base route bhi apiRouter se connect kar di gayi hai.

// --- Error Handling Middleware ---
// generalErrorMiddleware ko aakhri mein use karein.
app.use(generalErrorMiddleware); 

// --- Server Startup ---
// Render automatically provides a PORT environment variable, agar nahi mila toh 5000 use hoga.
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
