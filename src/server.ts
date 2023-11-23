import { Logger } from "./snoopbot";
import axios from "axios";
const express = require('express');

// Initialize express
const app = express();

// Declare default endpoint
app.get('/', (req: any, res: any) => {
    res.send("Hello world");
});

Logger.success("🚀Server running on port 3000!");

// Listen to port 3000
app.listen(3000);

// Load the server every 1.5 seconds to prevent from hibernating
setInterval(() => axios.get("http://localhost:3000/").then((response) => Logger.muted(`Server: ${response.data}`)), 1500);