const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body, //Copy all properties from req.body
        owner: req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task);
    }
    catch {
        res.status(400).send(error);
    }
});

// GET /tasks?completed=true&limit=10&skip=20&sortBy=createdAt:asc (3rd page of completed tasks)
router.get('/tasks', auth, async (req, res) => {
    const match = {owner: req.user._id};
    const sort = {};
    var limit = 10;
    var skip = 0;
    
    if (req.query.limit && !isNaN(req.query.limit))
        limit = parseInt(req.query.limit);

    if (req.query.skip && !isNaN(req.query.skip))
        skip = parseInt(req.query.skip);

    if (req.query.completed)
        match.completed = req.query.completed === 'true';

    if (req.query.sortBy) {
        sortParts = req.query.sortBy.split(':');
        sort[sortParts[0]] = sortParts[1] === 'desc' ? -1 : 1;
    }

    try {
        const tasks = await Task.find(match).skip(skip).limit(limit).sort(sort);
        res.send(tasks);
    }
    catch {
        res.status(500).send();
    }
});

router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});

        if (!task)
            return res.status(404).send();

        res.send(task);
    }
    catch {
        res.status(500).send();
    }
});

router.patch('/tasks/:id', auth, async (req, res) => {
    const operations = Object.keys(req.body);
    const validOperations = ['description', 'completed'];
    const isValidOperation = operations.every((op) => validOperations.includes(op));

    if (!isValidOperation)
        return res.status(400).send('Invalid updates!');

    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});

        if (!task)
            return res.status(404).send();
            
        operations.forEach((field) => task[field] = req.body[field]);
        await task.save();

        res.send(task);
    }
    catch (e) {
        res.status(500).send(e);
    }

});

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});

        if (!task)
            return res.status(404).send();

        res.send(task);
    }
    catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;