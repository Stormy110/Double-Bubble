const { layout } = require('../utils');
const { Todo } = require('../models');

const showForm = (req,res)=>{
    res.render('todo-form', {
        locals: {

        },
        ...layout
    });
};

const processForm = async (req,res) => {
    const { name } = req.body;
    const { status } = req.body;
    const { id } = req.session.user;
    if (name && id) {
        const newToDo = await Todo.create({
            name,
            status,
            userID: id
        });
        res.redirect(`${req.baseUrl}/`)
    } else {
        res.redirect(`${req.baseUrl}`);
    };
};

const list = async (req,res) => {
    const { id } = req.session.user;
    if(id) {
        const todos = await Todo.findAll({
            where: {
                userID: id
            }
        });
        res.render('todo-list', {
            locals: {
                todos
            },
            ...layout
        });
    } else {
        res.redirect('/')
    };
};

module.exports = {
    showForm,
    processForm,
    list
}