function errorHandler(err, req, res, next){
    if(err.name === 'UnauthorizedError'){
        // Authorization errors
        return res.status(401).json({message: 'The user is not Authorized...'})
    }

    if(err.name === 'ValidationError'){
        // Validation errors
        return res.status(401).json({message: err}) 
    }

    if(err){
        // Server errors
        return res.status(500).json(err);
    }
}

module.exports = errorHandler;