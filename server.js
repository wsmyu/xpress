const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

app.get('/',(req,res)=>{
  res.send("Hello, Express");
});

//Connect to Mongodb
mongoose
  .connect("mongodb+srv://michelle:admin@cluster0.yaes2w7.mongodb.net", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`Mongodb Connected`))
  .catch((err) => console.log(err));

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    //Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send({ error: "Username already exists" });
    }

    //Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); //The number 10 here is the salt rounds

    //Create a new user and save to database
    const user = new User({
      username,
      password: hashedPassword, //so in the database, the admin will not see the real passwordf
    });

    await user.save(); //use await, to wait for this function to be completed

    console.log("User registered ");
    res.status(201).send("User registered successfully"); //Sending a success response
  } catch (error) {
    console.log("User not register", error); //This error shows up in your logs
    res.status(500).send({ error: "Internal Server Error" }); //Sending an error response to the browser
  }
});

//User login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found while trying to login");
      return res.status(401), send({ error: "Invalid username or password" });
    }

    //Check if the password is correct

    const isMatch = await bcrypt.compare(password, user.password); // compare function return a boolean
    if (!isMatch) {
      
      return res.status(401).send({ error: "Invalid username or password" });
    }
    //Create a jwt token
    const token = jwt.sign({ userId: user._id }, "yourJWTSecret", {
      expiresIn: "1h",
    });
    console.log("User logged in");
    res.send({ token });
    
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
