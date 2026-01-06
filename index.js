const express = require('express');
const cors = require('cors');
const nodemailer = require("nodemailer");
const mongoose = require('mongoose');
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
mongoose.connect("mongodb+srv://navinraj:147852@cluster0.wpj3jve.mongodb.net/passkey?appName=Cluster0")
    .then(() => console.log("Connected to MongoDB"))
    .catch(() => console.log("MongoDB connection failed"));

const credential = mongoose.model("credential", {}, "bulkmail");


// // Test route to see DB data
// app.get("/checkdata", async (req, res) => {
//   const data = await credential.find({});
//   console.log("DB DATA:", data);
//   res.json(data);
// });


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
                        from: "navinrajmsw@gmail.com",
                        to: emailList[0],
                        subject: "Test Email",
                        text: msg
                    }
                    )
                    console.log("Email sent to:", emailList[i]);
                }
                resolve("Success");
            } catch (error) {
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

app.listen(5000, function () {
    console.log("Server started on port 5000");
});