const express = require('express');
const cors = require('cors');
const nodemailer = require("nodemailer");
const mongoose = require('mongoose');
require("dotenv").config();

const app = express();

app.use(express.json());

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://bulk-mail-frontend-blush.vercel.app",
        "https://bulk-mail-frontend-ghcwonqmo-navinrajs-projects.vercel.app"
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
}));

// DB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(() => console.log("MongoDB connection failed"));

const credential = mongoose.model("credential", {}, "bulkmail");

app.post("/sendemail", function (req, res) {
    var msg = req.body.msg;
    var emailList = req.body.emailList;
    credential.find().then(function (data) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: data[0].toJSON().user,
                pass: data[0].toJSON().pass,
            },
        });

        new Promise(async function (resolve, reject) {

            try {

                for (var i = 0; i < emailList.length; i++) {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: emailList[i],
                        subject: "Test Email",
                        text: msg
                    }
                    )
                    console.log("Email sent to:", emailList[i]);
                }
                resolve("Success");
            } catch (error) {
                console.error("Mail error:", error);
                reject("Faild");
            }
        }).then(function () {
            res.send(true);
        }).catch(function () {
            res.send(false);
        });

    }).catch(function (error) {
        console.log(error)
    })

})

 const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
