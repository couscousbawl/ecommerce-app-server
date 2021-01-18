const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// get all users
router.get(`/`, async (req, res) =>{

    const userList = await User.find().select('name phone email'); 
    
    if(!userList){
        res.status(500).json({success: false})
    }
    res.status(200).send(userList);
})

// get a user by id
router.get(`/:id`, async (req, res) =>{

    const user = await User.findById(req.params.id).select('name phone email'); 
    if(!user){
        res.status(500).json({message: 'The user with the given ID was not found...'})
    }
    res.send(user);
})

//insert a user
router.post(`/`, async (req, res) =>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        street: req.body.street,
        zone: req.body.zone,
        building: req.body.building,
        apartment: req.body.apartment,
        city: req.body.city,
        country: req.body.country,
        isAdmin: req.body.isAdmin
    })
    user = await user.save();
    
    if(!user)
    return res.status(404).send('The user cannot be created... ');

    res.send(user);
})

// login a user
router.post('/login', async (req, res) => {
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.secret;//
    if(!user){
        return res.status(400).send('The user not found...');
    }

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const token = jwt.sign(
            {userId: user.id, isAdmin: user.isAdmin}, secret, {expiresIn: '1w'}
        )
        res.status(200).send({user: user.email, token: token})
    }else{
        res.status(400).send('Email or password are not correct...');
    }
})

// register a user
router.post('/register', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        street: req.body.street,
        zone: req.body.zone,
        building: req.body.building,
        apartment: req.body.apartment,
        city: req.body.city,
        country: req.body.country,
        isAdmin: req.body.isAdmin
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})

// count all users
router.get(`/get/count`, async (req, res) =>{

    const userCount = await User.countDocuments((count) => count)
    
    if(!userCount){
        res.status(500).json({success: false})
    }
    res.send({userCount: userCount});
})

// delete a user by id
router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id).then(user => {
        if(user) {
            return res.status(200).json({success: true, message: 'the user is deleted!'})
        } else {
            return res.status(404).json({success: false , message: 'User not found!'})
        }
    }).catch(err => {
       return res.status(500).json({success: false, error: err}) 
    })
})

module.exports = router;