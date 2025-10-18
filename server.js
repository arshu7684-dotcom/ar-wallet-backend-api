// --- FIX 1: Dotenv ko sabse pehle load karein ---
require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');

// --- FIX 2: Galat paths ko .js extension se theek karein (Case-sensitivity fix) ---
// Aapki files root folder mein hain (routesapi.js, middlewaregeneralerror.js)
const apiRouter = require('./routesapi.js'); 
const generalErrorMiddleware = require('./middlewaregeneralerror.js'); 

// --- Database Connection ---
// MONGO_URI Render ke Environment Variables se aayega.
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connection successfully!'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    // Agar DB connect na ho toh server start na karein
});

// --- Security and Middleware ---
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(helmet()); // Basic security settings
app.use(cors()); // Enable CORS

// --- Routes ---
// Aapki routes file ka istemaal
app.use('/api/v1/auth', apiRouter); 
app.use('/', apiRouter); 

// --- Error Handling Middleware ---
app.use(generalErrorMiddleware); 

// --- Server Startup ---
// PORT Render ke Environment Variables se milega, warna 5000 use hoga.
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
