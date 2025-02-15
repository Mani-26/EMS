require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const QRCode = require("qrcode");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

// Models
const Event = mongoose.model(
  "Event",
  new mongoose.Schema({
    name: String,
    date: String,
    description: String,
    seatLimit: Number, // New field for seat limit
    registeredUsers: { type: Number, default: 0 }, // Tracks how many users registered
  })
);

const Registration = mongoose.model(
  "Registration",
  new mongoose.Schema({
    email: String,
    eventId: String,
    ticket: String,
  })
);

// Get all events
app.get("/api/events", async (req, res) => {
  const events = await Event.find();
  res.json(events);
});
// Create a new event (Admin Only)
app.post("/api/events", async (req, res) => {
  const { name, date, description, seatLimit } = req.body;

  if (!name || !date || !description || !seatLimit) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newEvent = new Event({
      name,
      date,
      description,
      seatLimit,
      registeredUsers: 0,
    });
    await newEvent.save();
    res
      .status(201)
      .json({ message: "Event created successfully!", event: newEvent });
  } catch (error) {
    res.status(500).json({ message: "Error creating event", error });
  }
});
app.get("/api/events/:eventId", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    res.json({
      name: event.name,
      date: event.date,
      description: event.description,
      seatLimit: event.seatLimit,
      registeredUsers: event.registeredUsers,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching event", error });
  }
});

app.put("/api/events/:id", async (req, res) => {
    const { id } = req.params;
    const { name, date, description, seatLimit } = req.body;
  
    try {
      const event = await Event.findByIdAndUpdate(id, { name, date, description, seatLimit }, { new: true });
      if (!event) {
        return res.status(404).json({ message: "Event not found!" });
      }
      res.json({ message: "Event updated successfully!", event });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // DELETE an event
app.delete("/api/events/:id", async (req, res) => {
    try {
      const event = await Event.findByIdAndDelete(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found!" });
      }
      res.json({ message: "❌ Event deleted successfully!", event });
    } catch (error) {
      res.status(500).json({ message: "Server error while deleting", error });
    }
  });
  
  
// app.post("/api/register", async (req, res) => {
//   const { email, eventId } = req.body;

//   try {
//     const event = await Event.findById(eventId);
//     if (!event) return res.status(404).json({ message: "Event not found" });

//     // Check if seats are available
//     if (event.registeredUsers >= event.seatLimit) {
//       return res.status(400).json({ message: "Event is fully booked!" });
//     }

//     // Generate QR Code
//     const ticketCode = `${email}-${eventId}`;
//     const qrImage = await QRCode.toDataURL(ticketCode);

//     // Save Registration
//     const registration = new Registration({ email, eventId, ticket: qrImage });
//     await registration.save();

//     // Increase registered count
//     event.registeredUsers += 1;
//     await event.save();

//     // Send Email with QR Code
//     let transporter = nodemailer.createTransport({
//       service: "Gmail",
//       auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
//     });

//     let mailOptions = {
//       from: "Company Events",
//       to: email,
//       subject: "Your Event Ticket",
//       attachments: [
//         {
//           filename: "ticket.png",
//           content: qrImage.split(";base64,").pop(),
//           encoding: "base64",
//         },
//       ],
//     };

//     await transporter.sendMail(mailOptions);
//     res.json({ message: "Ticket sent successfully!" });
//   } catch (error) {
//     console.error("Error during registration:", error);
//     res.status(500).json({ message: "Failed to register", error });
//   }
// });

app.post("/api/register", async (req, res) => {
  const { email, eventId } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check if event date is in the past
    const today = new Date();
    const eventDate = new Date(event.date);

    if (eventDate < today) {
      return res.status(400).json({ message: "Registration closed! Event date has passed." });
    }

    // Check if seats are available
    if (event.registeredUsers >= event.seatLimit) {
      return res.status(400).json({ message: "Event is fully booked!" });
    }

    // Generate QR Code
    const ticketCode = `${email}-${eventId}`;
    const qrImage = await QRCode.toDataURL(ticketCode);

    // Save Registration
    const registration = new Registration({ email, eventId, ticket: qrImage });
    await registration.save();

    // Increase registered count
    event.registeredUsers += 1;
    await event.save();

    // Send Email with QR Code
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    let mailOptions = {
      from: "Company Events",
      to: email,
      subject: "Your Event Ticket",
      attachments: [
        {
          filename: "ticket.png",
          content: qrImage.split(";base64,").pop(),
          encoding: "base64",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Ticket sent successfully!" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Failed to register", error });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
