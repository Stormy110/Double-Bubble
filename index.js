require('dotenv').config();    // don't forget to require dotenv


const { Todo } = require('./models');
const http = require('http');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const es6Renderer = require('express-es6-template-engine');

const session = require('express-session');
const FileStore = require('session-file-store')(session);

const { layout } = require('./utils');
const homeController = require('./controllers/home');
const {
    userRouter,
    todoRouter
} = require('./routers/index');

const { requireLogin } = require('./auth')

const app = express();
const server = http.createServer(app);

const PORT = 3000;
const HOST = '0.0.0.0';

const logger = morgan('tiny');

app.use(express.static('public'))
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
    res.render('members', {
        locals: {
            username
        },
        ...layout 
    });
});

// this is for updating the database
app.get('/todo/:id', async (req,res)=>{

    console.log(`The id is ${req.params.id}`);
    const todo = await Todo.findByPk(req.params.id);
    res.render('todo-form2',{
        locals: {
            todoName: todo.name
        },
        ...layout
    })
});

app.post('/todo/:id', async (req,res)=>{
    const { name } = req.body;
    const { id } = req.params;

    const updatedTodo = await Todo.update({
        name
    },{
        where: {
            id
        }
     });
     res.redirect('/todo')
});

// this is for deleting something in the database
app.get('/todo/:id/delete', async (req,res)=>{
    //show them the delete form

    // get the id from req.params
    const { id } = req.params;
    //get the todo from the database
    const todo = await Todo.findByPk(id)
    //render the delete form, showing the title
    res.render('delete',{
        locals: {
            name: "Delete todo",
            todoName: todo.name
        },
        ...layout
    })
});

app.post('/todo/:id/delete', async (req,res)=>{
   // process the delete form

    const { id } = req.params;
    const deletedTodo = await Todo.destroy({
        where: {
            id
        }
    });
    res.redirect('/todo')
});


app.use('/todo', todoRouter)

app.get('/unauthorized', (req, res) => {
    res.send(`You shall not pass!`);
});


server.listen(PORT, HOST, () => {
    console.log(`Listening at http://${HOST}:${PORT}`);
});