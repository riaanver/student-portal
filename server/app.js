// importing express module and initialize app
const express = require('express');
const app = express();

// defining port
const PORT = 3000;

// GET route
app.get('/', (req, res) => {
    res.send('API is running');
});

// listen on PORT
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});