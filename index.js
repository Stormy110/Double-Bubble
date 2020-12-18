require('dotenv').config();    // don't forget to require dotenv

const http = require('http');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const es6Renderer = require('express-es6-template-engine');

const session = require('express-session');
const FileStore = require('session-file-store')(session);

const homeController = require('./controllers/home');
const {
    userRouter,
} = require('./routers/index');

const { requireLogin } = require('./auth')

const app = express();
const server = http.createServer(app);

const PORT = 3000;
const HOST = '0.0.0.0';

const logger = morgan('tiny');

app.engine('html', es6Renderer);
app.set('views', 'templates');
app.set('view engine', 'html');

app.use(session({
    store: new FileStore(),  // no options for now
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: true,
    rolling: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // how many ms until session expires, 1 week
    }
}));



app.use(logger);
// Disabling for local development
// app.use(helmet());

// Parse any form data from POST requests
app.use(express.urlencoded({extended: true}));

app.get('/', homeController.home);

app.use('/users', userRouter);

app.use(requireLogin);



app.get('/members-only', (req, res) => {
    console.log(req.session.user);
    const { username } = req.session.user;
    res.send(`

<h1>Hi ${username}!</h1>
<p>Want to add some dinner ideas?</p>
<a href="/ideas/new">Click Here</a>
<br>
<a href="/ideas">Dinner Idea List</a>
<br>
<a href="/users/logout">Log out</a>
    `);
});
//pp.use('/ideas', ideasRouter)
app.get('/unauthorized', (req, res) => {
    res.send(`You shall not pass!`);
});


server.listen(PORT, HOST, () => {
    console.log(`Listening at http://${HOST}:${PORT}`);
});