require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('backend running');
});

const workerRoutes = require('./src/routes/workerRoutes');
app.use('/api/workers', workerRoutes);

const cooperativeRoutes = require('./src/routes/cooperativeRoutes');
app.use('/api/cooperatives', cooperativeRoutes);

const customerRoutes = require('./src/routes/customerRoutes');
app.use('/api/customers', customerRoutes);

const bookingRoutes = require('./src/routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

const subscriptionRoutes = require('./src/routes/subscriptionRoutes');
app.use('/api/subscriptions', subscriptionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});