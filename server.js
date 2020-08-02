const express = require('express');
const bodyParser = require('body-parser');
const { promisify } = require('util');
const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcrypt');


//express app
const app = express();

//middleware & static files
app.use(express.static('public'));
app.use(bodyParser.json());


// connect to mongodb
const dbURI = 'mongodb+srv://petninja:test1234@nodetuts.1kquj.mongodb.net/nodetuts?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopoplogy: true})
    .then((result) => console.log('connected to db'))
    .catch((err) => console.log(err));

//mongoose and mongo routes
app.post('/register', async (req, res) => {

    const {
        firstName,
        lastName,
        username,
        password
    } = req.body;

    try {
        let user = await User.findOne({
            username
        });
        if (user) {
            return res.status(400).json({
                msg: "User Already Exists"
            });
        }

        user = new User({
            firstName,
            lastName,
            username,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
    }
    catch{
        console.log("Error while register");
    }

});

app.get('/all-users', (req, res) => {
    User.find()
        .then((result => {
            res.send(result);
        }))
        .catch((err) => {
            console.log(err);
        });
});

app.post('/login', async (req, res) => {

    const { username, password } = req.body;

    const user = await User.findOne({username});
    
    if(!user) {
        return res.status(400).send('Cannot find user');
    }
    try{
        const isMatch = await bcrypt.compare(password, user.password);

        if(isMatch){
            res.send('Success');
        } else{
            res.send('Not Allowed')
        }
    }
    catch{
        res.status(500).send('Fail');
    }
});



    
//ROUTES
app.get('/', (req, res) => {
    res.send('We are on home');
});



//Listening to the server
app.listen(3000);
