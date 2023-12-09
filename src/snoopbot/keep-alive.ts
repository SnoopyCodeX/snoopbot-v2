import { Logger } from "@snoopbot";
import dotenv from 'dotenv';
import cron from "node-cron";

import axios from "axios"
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
app.listen(port, () => {
    Logger.success(`🚀Server running on port ${port}!`);

    if(!process.env.IS_LOCAL) {
        cron.schedule("*/5 * * * *", () => {
            axios.get(`https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`.toLowerCase())
        });
    }
});