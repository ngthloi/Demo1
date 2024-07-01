const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/traffic_violations', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define Event schema and model
const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: { type: Date, default: Date.now },
  violation: Boolean
});

const Event = mongoose.model('Event', eventSchema);

// POST endpoint to create an event
app.post('/api/events', (req, res) => {
  const newEvent = new Event(req.body);
  newEvent.save((err, event) => {
    if (err) return res.status(500).send(err);
    return res.status(200).json(event);
  });
});

// GET endpoint to retrieve events
app.get('/api/events', (req, res) => {
  Event.find({}, (err, events) => {
    if (err) return res.status(500).send(err);
    return res.status(200).json(events);
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${3000}`);
});
