const express = require("express");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {db, User} = require("./database");
const cookieParser = require('cookie-parser'); 



const app = express();
app.use(express.json());
app.use(cookieParser());


const cors = require("cors");
app.use(cors({
  origin: "http://127.0.0.1:5500", // where your frontend runs
  credentials: true
}));



app.post("/account/new", async (req, res) => {
    try{
        const {usernameFromInput, passwordFromInput, confirmPasswordFromInput} = req.body;

        if (passwordFromInput !== confirmPasswordFromInput)
            return res.status(422).json({error: "Confirm password and password do not match."});


        const commonUsernames = await User.findOne({
            where : {username: usernameFromInput}
        });


        if (commonUsernames)
            return res.status(400).json({error : "User already exists"});


        const hashedPassword = await argon2.hash(passwordFromInput);
        
        const userDetails = await User.create({
            "username" : usernameFromInput,
            "password" : hashedPassword
        });

        return res.status(201).json(
            {
                "username" : userDetails.username,
                "createdAt" : userDetails.createdAt
            });


    } catch(error){
        return res.status(500).json("Something went wrong on server side");
    }
});

app.post("/account/login", async (req, res) => {
    try{
        const {usernameFromInput, passwordFromInput} = req.body;

        const userInDb = await User.findOne({
            where: {username : usernameFromInput},
            attributes: ["id", "username","password"]
        });


        if (!userInDb)
            return res.status(404).json({error: "User not found"});


        const valid = await argon2.verify(userInDb.password, passwordFromInput);
        if (!valid) 
            return res.status(401).json({error: "Invalid Username/ Password"});



        //jwt
        const accessToken = jwt.sign({ username: userInDb.username }, process.env.JWT_SECRET, {
            expiresIn: "5m"
        });


        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
            maxAge: 300000,
            sameSite: "Lax"
        });

        const refreshToken = jwt.sign({ username: userInDb.username }, process.env.JWT_SECRET, {
            expiresIn : "1d"
        });

        userInDb.refreshToken = refreshToken;
        await userInDb.save();

        return res.status(200).json({message: "Login Successful", accessToken, username: userInDb.username});
    
    } catch(error){
        return res.status(500).json({error: "Login Failed"});
    }
});

app.get("/refresh", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) 
        return res.status(401).json({error: "No token provided"});

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return res.json({message: `Welcome ${decoded.username}!` });     
    } catch(error){
        return res.status(403).json({error: "Invalid or expired token"});
    }
})

app.get("/check-cookie", (req, res) => {
    console.log(req.cookies); // prints all cookies as an object
    console.log(req.cookies.accessToken); // prints the access token
    res.send("Check server console for cookie!");
});

const PORT = process.env.PORT;
app.listen(PORT, () => [
    console.log(`Server is running on ${PORT}.`)
])



