const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 80;

app.use(express.json()); // For parsing application/json
app.use(express.static(path.join(__dirname, '../frontend')));

// Example API endpoint
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from the API!' });
});

// More API endpoints can be added here

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});