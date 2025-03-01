const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    richDescription:{
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    images: [{
        type: String,
    }],
    brand: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    countInStock: {
        type: Number,
        required: true,
        default: 0 
    },
    rating: {
        type: Number,
        default: 0 
    },
    numReviews: {
        type: Number,
        default: 0 
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    dateCreated:{
        type: String
    },
    dateUpdated:{
        type: String
    }
})

productSchema.method('toJSON', function(){
    const { __v, ...object } = this.toObject();
    const { _id:id, ...result } = object;
    return { ...result, id };
});

 exports.Product = mongoose.model('Product', productSchema);