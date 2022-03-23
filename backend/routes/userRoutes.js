const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../config/generateToken');
const {authorized} = require('../middleware/authMiddleware');

const registerUser = asyncHandler(async(req, res) => {
    const {name, email, password, pic} = req.body;
    if(!name || !email || !password) {
        res.status(400);
        throw new Error("Please provide all details");
    }

    const userExists = await User.findOne({email});
    if(userExists) {
        res.status(400);
        throw new Error("User already Exists");
    }

    const user = await User.create({
        name,
        email,
        password,
        pic
    })

    if(user) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id)
        })
    } else {
        res.status(400);
        throw new Error("Failed to create user");
    }
})

const authUser = asyncHandler(async(req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email});

    if(user && (await user.matchPassword(password))) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id)
        })
    } else {
        res.status(400);
        throw new Error("Invalid email or password");
    }
})

const getUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search;
    const searchFilter = keyword ? {
        $or: [
            { name: { $regex: keyword, $options: 'i'} },
            { email: { $regex: keyword, $options: 'i'} },
        ],
        _id: { $ne: req.user._id }
    } : { _id: { $ne: req.user._id } };
    
    const users = await User.find(searchFilter);
    res.send(users);
})

// get
router.get('/', authorized, getUsers);

// post
router.post('/', registerUser);
router.post('/login', authUser);

module.exports = router;