const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const KIE_API_KEY = process.env.KIE_API_KEY || '<ВАШ_API_КЛЮЧ>';
const KIE_API_URL = 'https://kie.ai/api/generate';

app.post('/generate', async (req, res) => {
    const prompt = req.body.prompt || 'nano banana';
    try {
        const response = await axios.post(
            KIE_API_URL,
            { prompt },
            {
                headers: {
                    'Authorization': `Bearer ${KIE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Статика для фронта: отдаём из dist
const path = require('path');
app.use(express.static(path.join(__dirname, '../dist')));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
