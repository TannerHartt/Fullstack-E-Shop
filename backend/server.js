const express = require('express');
const env = require('dotenv/config');
const morgan = require('morgan');
const mongoose = require('mongoose');
const app = express();
const api = process.env.API_URL;
const cors = require('cors');


// Middleware
app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use(morgan('tiny'));


const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const usersRouter = require('./routes/user');
const categoriesRouter = require('./routes/categories');

// Mount routes
app.use(`${api}/products`, productsRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/categories`, categoriesRouter);


mongoose.connect(process.env.CONNECTION_STRING, {
    dbName: 'Cluster0'
}).then(() => {
    console.log("DB connection is ready!");
}).catch(() => {
    console.log("Connection error!");
});

app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});
