const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 80;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));


app.get('/api/breach/:hash', async (req, res) => {
    const hash = req.params.hash;
    const prefix = hash.slice(0, 5);

    try {
        const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);

        res.set('Content-Type', 'text/plain');
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching data from the external API' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});