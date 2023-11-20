const express = require('express');

// Initialize express
const app = express();

// Declare default endpoint
app.get('/', (req: any, res: any) => {
    res.send("Hello world");
});

// Listen to port 3000
app.listen(3000);