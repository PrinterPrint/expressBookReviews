const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const axios = require('axios'); // Import axios

const app = express();

// login with created users: http://localhost:5000/customer/login

app.use(express.json());

app.use("/customer", session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}));

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here
    if (req.session.authorization && req.session.authorization.accessToken) {
        //Verify access token
        jwt.verify(req.session.authorization.accessToken, 'access', (err, decoded) => {
            if (err) {
                return res.status(403).json({message:"Unauthorized. Invalid. token."});
            } else {
                // User is authenticated, proceed to the next middleware
                next();
            }
        });
    } else {
        return res.status(403).json({message: "Unauthorized. Access token missing."});
    }
});

app.post("/customer/register", async (req, res) => {
    try {
        const response = await axios.post('http://localhost:5000/customer/register', req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
