const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();

// Middleware en cada request. Para agregar middleware en ruta específica, agregarlo como segundo parámetro en el método.

// Will handle all the requests first
//
// app.use((req, res) => {
//     res.status(503).send('Server in mantainance. Check back soon!');
// });

app.use(express.json()); // Parse automatically JSON body into req.body
app.use(userRouter);
app.use(taskRouter);

module.exports = app;