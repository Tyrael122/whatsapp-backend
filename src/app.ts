import express from 'express';

const app = express();

// Middleware
app.use(express.json());

export default app; // Export the app as a default module
