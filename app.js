const express = require('express'); 
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const authJWT = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

require('dotenv/config');

const api = process.env.API_URL;
process.env.TZ = 'Asia/Bahrain';

const nDate = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Bahrain'
  });
  
  console.log(nDate);


const productsRouter = require('./routers/products');
const categoriesRouter = require('./routers/categories');
const usersRouter = require('./routers/users');
const ordersRouter = require('./routers/orders');

//middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());
app.options('*', cors);
app.use(authJWT());
app.use(errorHandler);
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));

//routers
app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter); 

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false 
})
.then(() => {
    console.log('Database connection success...');
})
.catch((err) => {
    console.log(err);
})


// DEVELOPMENT
/* app.listen(3000, () => {
    console.log(api);
    console.log('Server is running on localhost:3000...');
}) */

// PRODUCTION
var server = app.listen(process.env.PORT || 3000, function() {
    var port = server.address().port;
    console.log('Server is running on port: ' + port + ' .....');
})