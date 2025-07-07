const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to MongoDB (local or Atlas)
mongoose.connect('mongodb://127.0.0.1:27017/exercise-tracker');

// Mongoose schemas and models

const exerciseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  date: { type: Date, required: true },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  log: [exerciseSchema],
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Exercise Tracker API</h1><p>Use the endpoints to manage users and exercises.</p>');
});
// 1. POST /api/users - create new user
app.post('/api/users', async (req, res) => {
  try {
    const username = req.body.username;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    let user = await User.findOne({ username });
    if (user) return res.json({ username: user.username, _id: user._id });

    user = new User({ username, log: [] });
    await user.save();
    res.json({ username: user.username, _id: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET /api/users - get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, { username: 1 }).exec();
    res.json(users.map(u => ({ username: u.username, _id: u._id })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST /api/users/:_id/exercises - add exercise
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const userId = req.params._id;
    const { description, duration, date } = req.body;

    if (!description || !duration) {
      return res.status(400).json({ error: 'Description and duration are required' });
    }

    const durationNum = Number(duration);
    if (isNaN(durationNum)) {
      return res.status(400).json({ error: 'Duration must be a number' });
    }

    let exerciseDate = date ? new Date(date) : new Date();
    if (exerciseDate.toString() === 'Invalid Date') exerciseDate = new Date();

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const exercise = {
      description,
      duration: durationNum,
      date: exerciseDate,
    };

    user.log.push(exercise);
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      date: exercise.date.toDateString(),
      duration: exercise.duration,
      description: exercise.description,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. GET /api/users/:_id/logs - get user exercise logs with optional filters
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const userId = req.params._id;
    const { from, to, limit } = req.query;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let logs = user.log;

    // Filter by from/to dates
    if (from) {
      const fromDate = new Date(from);
      if (fromDate.toString() !== 'Invalid Date') {
        logs = logs.filter(e => e.date >= fromDate);
      }
    }
    if (to) {
      const toDate = new Date(to);
      if (toDate.toString() !== 'Invalid Date') {
        logs = logs.filter(e => e.date <= toDate);
      }
    }

    // Sort logs by date ascending
    logs.sort((a, b) => a.date - b.date);

    // Limit the number of logs
    const limitNum = limit ? Number(limit) : logs.length;
    logs = logs.slice(0, limitNum);

    const logFormatted = logs.map(e => ({
      description: e.description,
      duration: e.duration,
      date: new Date(e.date).toDateString(), // this guarantees proper string conversion
    }));



    res.json({
      _id: user._id,
      username: user.username,
      count: logFormatted.length,
      log: logFormatted,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
