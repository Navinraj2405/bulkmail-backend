const express = require('express');
const cors = require('cors');
const nodemailer = require("nodemailer");
const mongoose = require('mongoose');
const app = express();
app.use(cors());

app.use(express.json());

// MongoDB connection

mongoose.connect("mongodb+srv://navinraj:147852@cluster0.wpj3jve.mongodb.net/passkey?appName=Cluster0").then(function(){
  console.log("Connected to MongoDB");
}).catch(function(){
  console.log("MongoDB connection failed");
})

const credential = mongoose.model("credential",{},"bulkmail")


// Create a test account or replace with real credentials.


app.post("/sendmail", function (req, res) {

  var msg = req.body.msg;
  var emailList = req.body.emailList;

  credential.findOne().then(function(data){
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: data.toJSON().user,
    pass: data.toJSON().pass,
  },
});
 
  new Promise(async function(resolve,reject){
try {
    for (var i = 0; i < emailList.length; i++) {
     await transporter.sendMail(
        {
        from: "navinrajmsw@gmail.com",
        to: emailList[i],
        subject: "A message from Mulk mail app",
        text:msg,
      }
      )
      console.log("Email sent to: " + emailList[i]);
    }
    resolve("success");
  }
  catch (error) {
    reject("Failed");
  }
  }).then(function(){
    res.send(true);
  }).catch(function(){
    res.send(false);
  })  

}).catch(function(error){
  console.log(error);
})

})

app.listen(5000, function () {
  console.log("Server started on port 5000");
})