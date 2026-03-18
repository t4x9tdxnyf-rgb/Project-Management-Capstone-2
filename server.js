// server.js

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// ===== MongoDB Connection =====
mongoose.connect('mongodb://127.0.0.1:27017/projectDB')
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// ===== Schema =====
const projectSchema = new mongoose.Schema({
    title: String,
    description: String,
    status: String,
    category: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date
});

const Project = mongoose.model('Project', projectSchema);

// ===== Middleware =====
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ===== View Engine =====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ================= ROUTES =================

// HOME
app.get('/', async (req, res) => {
    const works = await Project.find();
    res.render('home', { works });
});

// CREATE PAGE
app.get('/create', (req, res) => {
    res.render('create');
});

// CREATE PROJECT
app.post('/create', async (req, res) => {

    const { title, description, status, category } = req.body;

    if (!title || !description) {
        return res.send("Title and Description are required");
    }

    const newProject = new Project({
        title,
        description,
        status: status || "Draft",
        category: category || "General"
    });

    await newProject.save();

    res.redirect('/');
});

// VIEW PAGE
app.get('/view/:id', async (req, res) => {

    try {
        const work = await Project.findById(req.params.id);

        if (!work) {
            return res.send("Project not found");
        }

        res.render('view', { work });

    } catch {
        res.send("Invalid ID");
    }

});

// EDIT PAGE
app.get('/edit/:id', async (req, res) => {

    try {
        const work = await Project.findById(req.params.id);

        if (!work) {
            return res.send("Project not found");
        }

        res.render('edit', { work });

    } catch {
        res.send("Invalid ID");
    }

});

// UPDATE PROJECT
app.post('/edit/:id', async (req, res) => {

    const { title, description, status, category } = req.body;

    await Project.findByIdAndUpdate(req.params.id, {
        title,
        description,
        status,
        category,
        updatedAt: new Date()
    });

    res.redirect('/view/' + req.params.id);
});

// DELETE PROJECT
app.post('/delete/:id', async (req, res) => {

    console.log("DELETE HIT:", req.params.id);

    await Project.findByIdAndDelete(req.params.id);

    res.redirect('/');
});

// START SERVER
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});