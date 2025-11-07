 // backend/server.js
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb+srv://navinraj:147852@cluster0.wpj3jve.mongodb.net/passkey?appName=Cluster0")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection failed:", err));

// Define schema properly
const credentialSchema = new mongoose.Schema({
  username: String,
  user: String,
  User: String,
  pass: String,
  Pass: String
}, { collection: "bulkmail" });

const Credential = mongoose.model("Credential", credentialSchema);

// POST /sendmail route
app.post("/sendmail", async (req, res) => {
  const { msg, emaillist } = req.body;

  if (!emaillist || emaillist.length === 0) {
    return res.status(400).json({ success: false, error: "No email addresses provided." });
  }

  try {
    // Get credentials from DB
    const credsData = await Credential.findOne();
    if (!credsData) {
      return res.status(500).json({ success: false, error: "No credentials found in DB." });
    }

    const creds = credsData.toObject();
    const user = creds.username || creds.user || creds.User;
    const pass = creds.pass || creds.Pass;

    if (!user || !pass) {
      return res.status(500).json({ success: false, error: "Missing email credentials." });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });

    await transporter.verify();
    console.log("✅ SMTP transporter ready.");

    // Send all emails concurrently
    const results = await Promise.allSettled(
      emaillist.map(email =>
        transporter.sendMail({
          from: user,
          to: email,
          subject: 'Bulk Mail Message',
          text: msg,
        })
      )
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`📤 Sent: ${sent}, ❌ Failed: ${failed}`);

    res.json({
      success: true,
      results: results.map((r, i) => ({
        email: emaillist[i],
        status: r.status === 'fulfilled' ? 'sent' : 'failed',
        error: r.reason?.message || null,
      })),
    });
  } catch (error) {
    console.error("❌ Error sending emails:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(5000, () => console.log("🚀 Server started on port 5000"));
