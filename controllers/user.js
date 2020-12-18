const bcrypt = require('bcryptjs');
const { layout } = require('../utils');
const { User } = require('../models');
const Sequelize = require('sequelize')

const newUser = (req,res) =>{
    res.render('login-form', {
            locals: {
                title: 'Sign Up'
            },
            ...layout
        }
    )
};

const processNewUser = async (req,res) =>{
    const { username, password } = req.body;
    console.log(username);
    if(username == '' || password == '') {
        console.log('username or password is blank', req.baseUrl);
        res.redirect(`${req.baseUrl}/new`)
    } else {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        try {
            const newUser = await User.create({
                username,
                hash
            });
            res.redirect(`${req.baseUrl}/login`);
        } catch (e) {
            console.log(e.name);
            if(e.name === "SequelizeUniqueConstraintError"){
                console.log('username is taken')
            }
            res.redirect(`${req.baseUrl}/new`)
        }
    }
};

const login = (req,res) =>{
    res.render('login-form', {
        locals:{
            title: 'Login'
        },
        ...layout
    });
};

const processLogin = async (req,res) => {
    const { username, password } = req.body;
    const user = await User.findOne({
        where: {
            username
        }
    });
    if(user) {
        console.log('valid user...checking password');
        const isValid = bcrypt.compareSync(password, user.hash);
        if (isValid) {
            console.log('password is good');
            req.session.user = {
                username,
                id: user.id
            };
            req.session.save(()=>{
                res.redirect('/members-only');
            });
        } else {
            console.log('but password is wrong');
            res.redirect(`${req.baseUrl}/login`);
        }
    } else {
        console.log('not a valid user');
        res.redirect(`${req.baseUrl}/login`);
    }
};

const logout = (req, res) => {
    console.log('logging out');
    req.session.destroy(() => {
        res.redirect('/');
    });
};

module.exports = {
    newUser,
    processNewUser,
    login,
    processLogin,
    logout
}