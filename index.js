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

// Schema
const credentialSchema = new mongoose.Schema({
  user: String,
  pass: String
});
const credential = mongoose.model("credential", credentialSchema, "bulkmail");

// Test route to see DB data
app.get("/checkdata", async (req, res) => {
  const data = await credential.find({});
  console.log("DB DATA:", data);
  res.json(data);
});

// Send Mail
app.post("/sendmail", function (req, res) {

    var msg = req.body.msg;
    var emailList = req.body.emaillist;  // FIXED

    if (!emailList || emailList.length === 0) {
        return res.send(false);
    }

    credential.findOne().then(function (data) {

        console.log("Fetched from DB:", data);

        if (!data) {
            console.log("No credential found in DB");
            return res.send(false);
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: data.user,
                pass: data.pass,
            },
        });

        (async () => {
            try {
                for (let i = 0; i < emailList.length; i++) {
                    await transporter.sendMail({
                        from: data.user,
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
