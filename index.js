const express = require('express');
const cors = require('cors');
const nodemailer = require("nodemailer");
const mongoose = require('mongoose');
require("dotenv").config();

const app = express();

app.use(express.json());

const corsOptions = {
    origin: "https://bulk-mail-frontend-blush.vercel.app",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: false
};

app.use(cors(corsOptions));
 
// DB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(() => console.log("MongoDB connection failed"));

const credential = mongoose.model("credential", {}, "bulkmail");

 app.post("/sendemail", async (req, res) => {
  try {
    const msg = req.body.msg;
    const emailList = req.body.emailList;

    const data = await credential.find();
    if (!data.length) {
      return res.status(500).json(false);
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: data[0].toJSON().user,
        pass: data[0].toJSON().pass,
      },
    });

    for (let i = 0; i < emailList.length; i++) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: emailList[i],
        subject: "Test Email",
        text: msg,
      });
      console.log("Email sent to:", emailList[i]);
    }

    res.json(true);
  } catch (error) {
    console.error("SEND EMAIL ERROR:", error);
    res.status(500).json(false);
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
