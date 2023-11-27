import { Logger } from "@snoopbot";
import dotenv from 'dotenv';

import express from 'express';
dotenv.config();

// Initialize express
const app = express();

// Declare default endpoint
app.get('/', (req: any, res: any) => {
    res.send("Hello world");
});

// Listen to port 3000 by default
const port = process.env.PORT || 3000
app.listen(port, () => Logger.success(`🚀Server running on port ${port}!`));