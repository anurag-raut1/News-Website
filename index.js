const express=require('express');
const app=express();
const users=require('./user');
const path=require('path');
const bcrypt=require('bcrypt')
const session=require("express-session")


const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/news_project')
  .then(() => {
    console.log('Connected to MongoDB successfully!');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });




app.set('view engine','ejs')
app.set('views',path.join(__dirname,'/views'))
app.use(express.urlencoded({extended:true}));
app.use(session({secret:'notagoodsecret'}))
app.use(express.static('public'));

app.get('/',(req,res)=>{
    res.render('practice.ejs')
})
app.get('/register',(req,res)=>{
    res.render("register");
})

// app.post('/register',async(req,res)=>{
//     const {username,password}=req.body;

//     const hash=await bcrypt.hash(password,12);
//     const user=new users({username,password:hash})
//     await user.save();
//     res.redirect('/');
    
// })


app.post('/register', async (req, res) => {
  const { fullname,email, password } = req.body;

  try {
    // Check if the username already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    // Hash the password with bcrypt
    const hash = await bcrypt.hash(password, 12);

    // Create a new user instance with the hashed password
    const user = new users({ fullname,email, password: hash });

    // Save the user to the database
    await user.save();
    req.session.user_id=user._id;

    // Redirect or respond with a success message
    res.redirect('/home'); // or res.status(201).send('User registered successfully');
  } catch (error) {
    // Handle any errors that might occur
    console.error('Error during registration:', error);
    return res.status(500).send('Internal Server Error');
  }
});

app.get('/login',(req,res)=>{
    res.render('login')
})

// app.post('/login',async(req,res)=>{
//     const {username,password}=req.body;
//     const user= await users.findOne({username});
//     const validPass = await bcrypt.compare(password,user.password);
//     if(validPass){
//         res.send("login successful")
//     }else{
//         res.send("invalid username or password");
//     }

// })

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find the user by username
      const user = await users.findOne({email});
  
      // Check if the user exists
      if (!user) {
        return res.status(400).send('Invalid username or password'); // Or render an error message
      }
  
      // Compare the provided password with the hashed password in the database
      const validPass = await bcrypt.compare(password, user.password);
  
      // If the password is incorrect, return an error
      if (!validPass) {
        return res.status(400).send('Invalid username or password'); // Or render an error message
      }
  
      // If login is successful, redirect or respond with a success message
      req.session.user_id=user._id;
      res.redirect('/home'); // Or send a success response
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).send('Internal Server Error');
    }
  });
  
app.get("/home",(req,res)=>{
  res.render('home')
})

app.get('/logout',(req,res)=>{
    // req.session.user_id=null;
    req.session.destroy();
    res.redirect("/")
})

app.get('/',(req,res)=>{
    if(!req.session.user_id){
        res.redirect('/login')
    }else{
      res.render('home');
    }
    
})

app.listen(3000,()=>{
    console.log("server is on port 3000")
})