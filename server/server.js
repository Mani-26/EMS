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
    name: String, // Added name field
    email: String,
    eventId: String,
    ticket: String, // QR Code
    attended: { type: Boolean, default: false },
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
  
  //     // Check if the user is already registered
  //     const existingRegistration = await Registration.findOne({ email, eventId });
  //     if (existingRegistration) {
  //       return res.status(400).json({ message: "You are already registered! Check your email for details." });
  //     }
  
  //     // Check if event date is in the past
  //     const today = new Date();
  //     const eventDate = new Date(event.date);
  
  //     if (eventDate < today) {
  //       return res.status(400).json({ message: "Registration closed! Event date has passed." });
  //     }
  
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
  
  //     // Create an HTML Email Template
  //     const emailContent = `
  //       <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
  //         <h2 style="text-align: center; color: #007bff;">🎉 Congratulations, You're Registered! 🎟</h2>
  //         <p>Dear <strong>${email}</strong>,</p>
  //         <p>We’re thrilled to confirm your registration for <strong>${event.name}</strong>! Get ready for an amazing experience.</p>
  
  //         <h3>📅 Event Details:</h3>
  //         <ul>
  //           <li><strong>Event Name:</strong> ${event.name}</li>
  //           <li><strong>Date:</strong> ${event.date}</li>
  //           <li><strong>Description:</strong> ${event.description}</li>
  //         </ul>
  
  //         <p>Attached below is your unique event ticket (QR Code). Please bring it with you for entry.</p>
  
  //         <h3>📌 Stay Connected:</h3>
  //         <p>Follow us for updates and behind-the-scenes content:</p>
  //         <p>
  //           🔗 <a href="https://www.linkedin.com/company/yourcompany" target="_blank">LinkedIn</a> | 
  //           📸 <a href="https://www.instagram.com/yourcompany" target="_blank">Instagram</a> | 
  //           🐦 <a href="https://twitter.com/yourcompany" target="_blank">Twitter</a>
  //         </p>
  
  //         <p>If you have any questions, feel free to reply to this email. We can't wait to see you at the event! 🎊</p>
  
  //         <p style="text-align: center; font-weight: bold;">🚀 See you soon! 🚀</p>
  //       </div>
  //     `;
  
  //     // Send Email with QR Code
  //     let transporter = nodemailer.createTransport({
  //       service: "Gmail",
  //       auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  //     });
  
  //     let mailOptions = {
  //       from: "Company Events <noreply@company.com>",
  //       to: email,
  //       subject: `🎟 Your Ticket for ${event.name}!`,
  //       html: emailContent,
  //       attachments: [
  //         {
  //           filename: "ticket.png",
  //           content: qrImage.split(";base64,").pop(),
  //           encoding: "base64",
  //         },
  //       ],
  //     };
  
  //     await transporter.sendMail(mailOptions);
  //     res.json({ message: "🎉 Registration successful! Check your email for details." });
  //   } catch (error) {
  //     console.error("Error during registration:", error);
  //     res.status(500).json({ message: "Failed to register", error });
  //   }
  // });

  
  app.post("/api/register", async (req, res) => {
    const { name, email, eventId } = req.body;
  
    try {
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ message: "Event not found" });
  
      // Check if user is already registered
      const existingRegistration = await Registration.findOne({ email, eventId });
      if (existingRegistration) {
        return res.status(400).json({ message: "You are already registered! Check your email for details." });
      }
  
      // Check if event date has passed
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
      const registration = new Registration({ name, email, eventId, ticket: qrImage });
      await registration.save();
  
      // Increase registered count
      event.registeredUsers += 1;
      await event.save();
  
      // Create an HTML Email Template
      const emailContent = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
          <h2 style="text-align: center; color: #007bff;">🎉 Congratulations, ${name}! You're Registered! 🎟</h2>
          <p>Dear <strong>${name}</strong>,</p>
          <p>We’re thrilled to confirm your registration for <strong>${event.name}</strong>! Get ready for an amazing experience.</p>
  
          <h3>📅 Event Details:</h3>
          <ul>
            <li><strong>Event Name:</strong> ${event.name}</li>
            <li><strong>Date:</strong> ${event.date}</li>
            <li><strong>Description:</strong> ${event.description}</li>
            <li><strong>Location:</strong> <a href="https://maps.app.goo.gl/bWQqasjGzqVjkGsW8" target="_blank">Click here</a></li>
          </ul>
  
          <p>Attached below is your unique event ticket (QR Code). Please bring it with you for entry.</p>
  
          <h3>📌 Stay Connected:</h3>
          <p>Follow us for updates and behind-the-scenes content:</p>
          <p>
             <a href="https://www.linkedin.com/company/yellowmatics" target="_blank">LinkedIn</a> | 
             <a href="https://www.instagram.com/yellowmatics.ai/" target="_blank">Instagram</a> | 
             <a href="https://bit.ly/YMWhatsapp" target="_blank">Whatsapp</a>
          </p>
  
          <p>If you have any questions, feel free to reply to this email. We can't wait to see you at the event! 🎊</p>
  
          <p style="text-align: center; font-weight: bold;">🚀 See you soon! 🚀</p>
        </div>
      `;
  
      // Send Email with QR Code
      let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
  
      let mailOptions = {
        from: "Company Events <noreply@company.com>",
        to: email,
        subject: `🎟 Your Ticket for ${event.name}, ${name}!`,
        html: emailContent,
        attachments: [
          {
            filename: "ticket.png",
            content: qrImage.split(";base64,").pop(),
            encoding: "base64",
          },
        ],
      };
  
      await transporter.sendMail(mailOptions);
      res.json({ message: `🎉 Registration successful, ${name}! Check your email for details.` });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ message: "Failed to register", error });
    }
  });
  



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
