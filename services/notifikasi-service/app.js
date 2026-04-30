require('dotenv').config();
const express = require('express');
const cors = require('cors');

const notifikasiRoutes = require('./routes/notifikasiRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', notifikasiRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'notifikasi-service', port: process.env.PORT });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Notifikasi service jalan di port ${PORT}`);
});