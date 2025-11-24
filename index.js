 const express = require('express');
const cors = require('cors');
const nodemailer = require("nodemailer");
const mongoose = require('mongoose');

const app = express();

app.use(express.json());

// Correct CORS
 app.use(cors({
    origin: ['https://bulk-mail-frontend-blush.vercel.app'],
    methods: ['GET','POST'],
    allowedHeaders: ['Content-Type'],
}));


// MongoDB connection
mongoose.connect("mongodb+srv://navinraj:147852@cluster0.wpj3jve.mongodb.net/passkey?appName=Cluster0")
.then(function() {
  console.log("Connected to MongoDB");
})
.catch(function() {
  console.log("MongoDB connection failed");
})

const credential = mongoose.model("credential", {}, "bulkmail");

// Send mail route
app.post("/sendmail", function (req, res) {

  var msg = req.body.msg;
  var emailList = req.body.emaillist;   // ✅ FIXED (your frontend sends emaillist)

  // Check if email list is missing
  if (!emailList || emailList.length === 0) {
    return res.send(false);
  }

  credential.findOne().then(function(data){

    // Check if no credentials found
    if (!data) {
      console.log("No credential found in database");
      return res.send(false);
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: data.toJSON().user,
        pass: data.toJSON().pass,
      },
    });

    new Promise(async function(resolve, reject) {
      try {

        for (var i = 0; i < emailList.length; i++) {

          await transporter.sendMail({
            from: data.toJSON().user,  // safer than hardcoding
            to: emailList[i],
            subject: "A message from Mulk mail app",
            text: msg,
          });

          console.log("Email sent to:", emailList[i]);
        }

        resolve("success");
      }
      catch (error) {
        console.log(error);
        reject("Failed");
      }

    }).then(function() {
      res.send(true);
    })
    .catch(function() {
      res.send(false);
    })

  }).catch(function(error){
    console.log(error);
    res.send(false);
  })
})

app.listen(5000, function () {
  console.log("Server started on port 5000");
})
