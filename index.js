
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb+srv://navin:navin1100@cluster0.jvmvh5b.mongodb.net/bulkmail?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB connection failed:", err));

// Credential model (bulkmail collection)
const Credential = mongoose.model("credential", {}, "bulkmail");

// POST route to send emails
app.post('/sendmail', async (req, res) => {
  const { msg, emaillist } = req.body;

  if (!emaillist || emaillist.length === 0) {
    return res.status(400).send("No email addresses provided.");
  }

  try {
    // Get credentials from DB
    const data = await Credential.find();
    if (!data || data.length === 0) {
      console.error("❌ No email credentials found in DB");
      return res.status(500).send("No email credentials found.");
    }

    const creds = data[0].toJSON();
    const user = creds.user || creds.User; // supports both lowercase and uppercase
    const pass = creds.pass || creds.Pass;

    if (!user || !pass) {
      console.error("❌ Email credentials missing in DB:", creds);
      return res.status(500).send("Email credentials are missing in the database.");
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }, // pass must be a Gmail app password
    });

    // Verify transporter before sending
    await transporter.verify();
    console.log("✅ SMTP transporter verified, ready to send emails.");

    // Send emails one by one
    for (let i = 0; i < emaillist.length; i++) {
      await transporter.sendMail({
        from: user,
        to: emaillist[i],
        subject: 'A message from Node.js',
        text: msg,
      });
      console.log(`📧 Email sent to: ${emaillist[i]}`);
    }

    res.send(true); // success
  } catch (error) {
    console.error("❌ Error sending emails:", error.message);
    res.status(500).send(false);
  }
});

// Start the server
app.listen(5000, () => {
  console.log("🚀 Server started on port 5000");
});

 