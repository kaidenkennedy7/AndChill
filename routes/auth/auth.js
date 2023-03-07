const router = require('express').Router();
const jwt = require('jsonwebtoken');

//server side rendering
const pages = require('../../util/ssr');

//express-validator for form validation
const { checkSchema, validationResult } = require('express-validator');

//javascript objects/schemas to be used with express-validator
const {register} = require('./validation-schema');

//mongoose Credentials model
const Credentials = require('../../db/model/credentials.js');

//password hashing
const bcrypt = require('bcrypt');
const saltRounds = Number(process.env.BCRYPT_SALTROUNDS);

/* ______________________________________________________________________________ */
//routes
router.get('/register', (req, res) => {
    res.send(pages.register);
});

router.get('/login', (req, res) => {
    if(req.session.userId){
        res.redirect('/');
    } else {
        res.send(pages.login);
    }
});

router.get('/auth/logout', (req, res) => {
    if(req.session.userId){
        req.session.destroy();
    }
    res.redirect('/');
});

router.post('/auth/register', checkSchema(register), async (req, res, next) => {
    //if express-validator validationResult contains any errors then form data is invalid
    //see -> validation-schema for details
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.errors = errors;
        res.status(401);
        return res.send(errors);
    }
    try {
        const email = req.body.email;
        const username = req.body.username;
        const plainTextPassword = req.body.password;
        const hashedPwd = await bcrypt.hash(plainTextPassword, saltRounds);
        const insertResult = await Credentials.create({
            email: email,
            username: username,
            password: hashedPwd
        });
        res.status(200);
        return res.send({});
    } catch (error) {
        res.status(500).send(`Internal server error`);
    }
});

router.post('/auth/login', async (req, res) => {
    try {
        const foundByUsername = await Credentials.findOne({ username: req.body.user}); //search database for a 
        const foundByEmail = await Credentials.findOne({ email: req.body.user});
        const foundUser = (foundByUsername) ? foundByUsername : foundByEmail; //ternary operation to find user by email if not found by username;
        if (foundUser) { 
            console.log(foundUser)
            const compared = await bcrypt.compare(req.body.password, foundUser.password);
            if (compared) {
                req.session.loggedIn = true;
                req.session.userId = req.body.user;
                console.log(req.body.user)
                res.status(200);
                return res.send({msg: 'Authenticated'});
            }
        }
        // if (foundUser) {
        //     const compared = await bcrypt.compare(req.body.password, foundUser.password);
        //     if (compared) {
        //         const token = jwt.sign({id: foundUser._id}, process.env.JWT_SECRET, {
        //             expiresIn: process.env.JWT_EXPIRES_IN,
        //         });
        //         return res.status(200).json({
        //             message: 'Authenticated',
        //             token,
        //         });
        //     }
        // }
        res.status(401);
        return res.send({msg: 'Invalid password or username'});
    } catch (error) {
        res.status(500).send(`Internal server error`);
    }
});

module.exports = {
    router
}