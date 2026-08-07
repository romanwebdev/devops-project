const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const redis = require('../redis');

const CACHE_KEY = 'todos:all';
const CACHE_TTL_SECONDS = 30;

// GET /todos — get all todos (cached)
router.get('/', async (req, res) => {
  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(JSON.parse(cached));
    }
  } catch (err) {
    console.error('Redis read error, falling back to DB:', err.message);
  }

  const todos = await Todo.find();
  res.set('X-Cache', 'MISS');
  res.json(todos);

  redis
    .set(CACHE_KEY, JSON.stringify(todos), 'EX', CACHE_TTL_SECONDS)
    .catch((err) => {
      console.error('Redis write error:', err.message);
    });
});

// POST /todos — create a new todo
router.post('/', async (req, res) => {
  try {
    const todo = await Todo.create(req.body);
    await redis.del(CACHE_KEY);
    res.status(201).json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /todos/:id — get a single todo
router.get('/:id', async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  res.json(todo);
});

// PUT /todos/:id — update a single todo
router.put('/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    await redis.del(CACHE_KEY);
    res.json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /todos/:id — delete a single todo
router.delete('/:id', async (req, res) => {
  const todo = await Todo.findByIdAndDelete(req.params.id);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  await redis.del(CACHE_KEY);
  res.status(204).send();
});

module.exports = router;
