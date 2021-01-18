const {Order} = require('../models/order');
const {orderItem, OrderItem} = require('../models/orderItem');
const express = require('express');
const { Product } = require('../models/product');
const router = express.Router();

const nDate = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Bahrain'
  });

//get all the orders
router.get(`/`, async (req, res) =>{

    const orderList = await Order.find().populate({path: 'user', select: 'name email phone -_id'}).sort({'orderDate': -1});
    if(!orderList){
        res.status(500).json({success: false})
    }
    res.status(200).send(orderList);
})

//get order by Id
router.get(`/:id`, async (req, res) =>{

    const order = await Order.findById(req.params.id)
    .populate({
        path: 'user', 
        select: 'name email phone -_id'
    })
    .populate({
        path: 'orderItems', 
        select: 'quantity product -_id', 
        populate: {
            path: 'product', 
            select: 'name description price countInStock -_id' //,populate{'category'}....
        }
    });

    if(!order){
        res.status(500).json({success: false})
    }
    res.status(200).send(order);
})

//insert an order
router.post(`/`, async (req, res) =>{
    // map the orderItems model with the order model and save the order items in a seprate collection
    const orderItemIds = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem =  new OrderItem({
             quantity: orderItem.quantity,
             product: orderItem.product
        })

        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
    }))

    const orderItemIdsResolved = await orderItemIds;

    // calculate the total price of the order
    const total = await Promise.all(orderItemIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const subtotal = orderItem.product.price * orderItem.quantity;
        return subtotal;
    }))
    const totalPrice = total.reduce((a,b) => a + b, 0);

    console.log(total);

    let order = new Order({
      orderItems: orderItemIdsResolved,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      country: req.body.country,
      zone: req.body.zone,
      building: req.body.building,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice,
      user: req.body.user,
      orderDate: nDate
    })
    order = await order.save();
    
    if(!order)
    return res.status(400).send('The order cannot be created... ');

    res.send(order);
})

//update an order
router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, {
        status: req.body.status
    },
    {
        new: true
    })

    if(!order)
    return res.status(404).send('The Order cannot be updated... ');

    res.send(order);
})

//delete an order by id
router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id).then( async order => {
        if(order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem);
            })
            return res.status(200).json({success: true, message: 'the order is deleted!'})
        } else {
            return res.status(404).json({success: false , message: 'Order not found!'})
        }
    }).catch(err => {
       return res.status(500).json({success: false, error: err}) 
    })
})

//show total sales
router.get('/get/totalsales', async (req, res) => {
    const totalsales = await Order.aggregate([
        {$group: {
            _id: null,
            totalsales: {$sum: '$totalPrice'}
        }}
    ])

    if(!totalsales){
        return res.status(400).send('Total sales cannot be generated...');
    }
    res.send({totalsales: totalsales.pop().totalsales});
})

// count all orders
router.get(`/get/count`, async (req, res) =>{

    const orderCount = await Order.countDocuments((count) => count)
    
    if(!orderCount){
        res.status(500).json({success: false})
    }
    res.send({orderCount: orderCount});
})

//get all the orders for a specific user
router.get(`/get/userorders/:id`, async (req, res) =>{

    const userOrderList = await Order.find({user: req.params.id}).populate({
        path: 'user', 
        select: 'name email phone -_id'
    })
    .populate({
        path: 'orderItems', 
        select: 'quantity product -_id', 
        populate: {
            path: 'product', 
            select: 'name description price countInStock -_id' //,populate{'category'}....
        }
    });
    
    if(!userOrderList){
        res.status(500).json({success: false})
    }
    res.status(200).send(userOrderList);
})


module.exports = router;


/*
Test Order

{
    "orderItems": [
        {
            "quantity": 3,
            "product": "5ff6e5460411503b0f545b15"
        },
        {
            "quantity": 2,
            "product": "5ff6e645aa7d063b2c36aaf5"
        }
    ],
    "shippingAddress1": "Al Markhiya",
    "shippingAddress2": "Street 100",
    "city": "Doha",
    "country": "Qatar",
    "zone": "56",
    "building": "93",
    "phone": "55193689",
    "user": "5ff9d9ac5e9daa56bb7e86ab",
    "totalPrice": 150
}

*/