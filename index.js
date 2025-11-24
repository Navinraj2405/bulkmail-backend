 const express = require('express');
const cors = require('cors');
const nodemailer = require("nodemailer");
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// ✅ FIXED CORS — allows both of your Vercel URLs
app.use(cors({
    origin: [
        "https://bulk-mail-frontend-blush.vercel.app",
        "https://bulk-mail-frontend-ghcwonqmo-navinrajs-projects.vercel.app"
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
}));

// MongoDB connection
mongoose.connect("mongodb+srv://navinraj:147852@cluster0.wpj3jve.mongodb.net/passkey?appName=Cluster0")
.then(() => console.log("Connected to MongoDB"))
.catch(() => console.log("MongoDB connection failed"));

const credential = mongoose.model("credential", {}, "bulkmail");

// Send mail route
app.post("/sendmail", function (req, res) {
    var msg = req.body.msg;
    var emailList = req.body.emaillist;

    if (!emailList || emailList.length === 0) {
        return res.send(false);
    }

    credential.findOne().then(function (data) {

        if (!data) {
            console.log("No credential found in DB");
            return res.send(false);
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: data.toJSON().user,
                pass: data.toJSON().pass,
            },
        });

        (async () => {
            try {
                for (let i = 0; i < emailList.length; i++) {
                    await transporter.sendMail({
                        from: data.toJSON().user,
                        to: emailList[i],
                        subject: "A message from Bulk mail app",
                        text: msg,
                    });
                    console.log("Email sent to:", emailList[i]);
                }
                res.send(true);
            } catch (error) {
                console.log(error);
                res.send(false);
            }
        })();

    }).catch(function (error) {
        console.log(error);
        res.send(false);
    });
});

app.listen(5000, function () {
    console.log("Server started on port 5000");
});
