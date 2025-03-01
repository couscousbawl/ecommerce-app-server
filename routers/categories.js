const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();


//get all the categories
router.get(`/`, async (req, res) =>{

    const categoryList = await Category.find(); 
    
    if(!categoryList){
        res.status(500).json({success: false})
    }
    res.status(200).send(categoryList);
})

//get one category by id
router.get(`/:id`, async (req, res) =>{

    const category = await Category.findById(req.params.id); 
    
    if(!category){
        res.status(500).json({message: 'The category with the given ID was not found...'})
    }
    res.status(200).send(category);
})

//insert a category
router.post(`/`, async (req, res) =>{
    let category = new Category({
        name: req.body.name,
        color: req.body.color,
        icon: req.body.icon,
        image: req.body.image
    })
    category = await category.save();
    
    if(!category)
    return res.status(404).send('The category cannot be created... ');

    res.send(category);
})

//update a category
router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        color: req.body.color,
        icon: req.body.icon
    },
    {
        new: true
    })

    if(!category)
    return res.status(404).send('The category cannot be updated... ');

    res.send(category);
})

//delete a category by id
router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if(category) {
            return res.status(200).json({success: true, message: 'the category is deleted!'})
        } else {
            return res.status(404).json({success: false , message: 'category not found!'})
        }
    }).catch(err => {
       return res.status(500).json({success: false, error: err}) 
    })
})

module.exports = router;