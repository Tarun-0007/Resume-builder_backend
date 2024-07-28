// const express = require("express");
// const cors = require("cors");
// const pdf = require("html-pdf");
// const pdfSample = require("./pdf-sample");

// const app = express();

// const port = 4000;

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.post("/create-pdf", (req, res) => {
//   pdf.create(pdfSample(req.body), {}).toFile("Resume.pdf", (err) => {
//     if (err) {
//       res.send(Promise.reject());
//       console.log(err);
//     }
//     res.send(Promise.resolve());
//     console.log("Success");
//   });
// });

// app.get("/fetch-pdf", (req, res) => {
//   res.sendFile(`${__dirname}/Resume.pdf`);
// });

// app.use(express.static("../client/build"));

// app.listen(port, () => {
//   console.log(`Server is running on port=${port}`);
// });


const express = require("express");
const cors = require("cors");
const pdf = require("html-pdf");
const pdfSample = require("./pdf-sample");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const port = 4000;


// MongoDB connection
mongoose.connect("mongodb+srv://tarun495:qohULsjHG4SbydW3@cluster0.wvkn2nz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(() => console.log("Connected to MongoDB")).catch(err => console.log(err));

// User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Registration route
app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({ username: req.body.username, password: hashedPassword, email:req.body.email });
    await user.save();
    res.status(201).send("User registered");
    res.status(201).send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Login route

app.post("/login", async (req, res) => {
  try {
    const userEmail= req.body.email;
    const user = await User.findOne({ email: userEmail });
    if( user === null){
      res.status(400).send("Cannot find user");
    }
    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
    if(!isPasswordMatch){
      res.status(400).send("Invalid credentials");
    }
    const token = jwt.sign({email: user.email});
    res.status(200).send({user: token});
    res.send({user: token});
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Middleware to protect routes
const authenticate = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, "your_jwt_secret", (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

// PDF creation route
app.post("/create-pdf", (req, res) => {
  pdf.create(pdfSample(req.body), {}).toFile("Resume.pdf", (err) => {
    if (err) {
      res.send(Promise.reject());
      console.log(err);
    }
    res.send(Promise.resolve());
    console.log("Success");
  });
});

// Fetch PDF route
app.get("/fetch-pdf", (req, res) => {
  res.sendFile(`${__dirname}/Resume.pdf`);
});

app.use(express.static("../client/build"));

app.listen(port, () => {
  console.log(`Server is running on port=${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello World");
})


