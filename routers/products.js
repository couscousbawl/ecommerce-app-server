const {Product} = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const multer = require('multer');
const { request } = require('express');


//get the current time and date
const nDate = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Bahrain'
  });

//image upload

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if(isValid) {
            uploadError = null
        }
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        
      const fileName = file.originalname.split(' ').join('-');
      const extension = FILE_TYPE_MAP[file.mimetype];
      cb(null, `_${Date.now()}.${extension}`)
    }
  })
const uploadOptions = multer({ storage: storage })

// get all products
router.get(`/`, async (req, res) =>{
    let filter = {};
    if(req.query.categories){
        if(!mongoose.isValidObjectId(req.query.categories)){
            return res.status(400).send('Invalid Category ID ');
        }
         filter = {category: req.query.categories.split(',')}
    }

    const productList = await Product.find(filter).populate('category');

    if(!productList) {
        res.status(500).json({success: false})
    } 
    res.send(productList);
})

// get a product by id
router.get(`/:id`, async (req, res) =>{

    const product = await Product.findById(req.params.id).select('name description category -_id').populate('category'); 
    if(!product){
        res.status(500).json({success: false})
    }
    res.send(product);
})

// add a new product
router.post(`/`, uploadOptions.single('image'), async (req, res) =>{
    const category = await Category.findById(req.body.category); 
    
    if(!category) 
    return res.status(400).send('Invalid Category...');

    const file = req.file;
    if(!file) return res.status(400).send('No image in the request');

    const fileName = file.filename
    const baseURL = `${req.protocol}://${req.get('host')}/public/uploads/`;
    

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${baseURL}${fileName}`, //"http://localhost:3000/public/uploads/1/12/2021,_10:20:25_AM.jpg"
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
        dateCreated: nDate
    })
    product = await product.save();

    if(!product)
    return res.status(500).send('The product cannot be created...')

    res.send(product);
})

//update the product gallery images
router.put('/gallery/:id', uploadOptions.array('images', 5), async (req, res) => {

    //check if the id of the product is valid
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid Product ID ');
    }

    const files = req.files;
    let imagesURL = [];
    const baseURL = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if(files){
        files.map(file => {
            imagesURL.push(`${baseURL}${file.filename}`);
        })
    }

    const product = await Product.findByIdAndUpdate(req.params.id, {
        images: imagesURL,
        dateUpdated: nDate
    },
    {
        new: true
    })

    if(!product)
    return res.status(404).send('The Product cannot be updated... ');

    res.send(product);
})

// update a product 
router.put('/:id', async (req, res) => {
    //check if the id of the product is valid
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid Product ID ');
    }

    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category');

    const product = await Product.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
        dateUpdated: nDate
    },
    {
        new: true
    })

    if(!product)
    return res.status(404).send('The Product cannot be updated... ');

    res.send(product);
})

// delete a product by id
router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(product => {
        if(product) {
            return res.status(200).json({success: true, message: 'the Product is deleted!'})
        } else {
            return res.status(404).json({success: false , message: 'Product not found!'})
        }
    }).catch(err => {
       return res.status(500).json({success: false, error: err}) 
    })
})

// count all products
router.get(`/get/count`, async (req, res) =>{

    const productCount = await Product.countDocuments((count) => count)
    
    if(!productCount){
        res.status(500).json({success: false})
    }
    res.send({productCount: productCount});
})

// get featured products
router.get(`/get/featured/:count`, async (req, res) =>{
    const count = req.params.count ? req.params.count : 0
    const productFeatured = await Product.find({isFeatured: true}).limit(+count);
    
    if(!productFeatured){
        res.status(500).json({success: false})
    }
    res.send(productFeatured);
})


module.exports = router;