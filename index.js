import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from "./src/db/connection.js";
import authRouter from "./src/routes/Auth/auth.js";
import galleryRouter from "./src/routes/Gallery/gallery.js";
import donationRouter from "./src/routes/Donation/donation.js";
import volunteerRouter from "./src/routes/Volunteer/volunteer.js";
import beneficiaryRouter from "./src/routes/Beneficiary/beneficiary.js";
import memberRouter from "./src/routes/Member/member.js";
import certificateRouter from "./src/routes/Certificate/certificate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io available to routes
app.set('io', io);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'OrbosisNGO Backend API is running!',
    status: 'Active',
    endpoints: {
      auth: '/api/auth',
      gallery: '/api/gallery',
      donation: '/api/donation',
      volunteer: '/api/volunteer',
      beneficiary: '/api/beneficiary',
      member: '/api/member',
      certificate: '/api/certificate'
    }
  });
});

// Test endpoint
app.get('/test', async (req, res) => {
  try {
    const mongoose = await import('mongoose');
    res.json({
      message: 'Test endpoint working',
      database: mongoose.default.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test registration endpoint
app.post('/test-register', async (req, res) => {
  try {
    res.json({
      message: 'Test registration endpoint working',
      body: req.body,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/donation", donationRouter);
app.use("/api/volunteer", volunteerRouter);
app.use("/api/beneficiary", beneficiaryRouter);
app.use("/api/member", memberRouter);
app.use("/api/certificate", certificateRouter);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-donor-room', (userId) => {
    socket.join(`donor-${userId}`);
    console.log(`User ${userId} joined donor room`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

connectDB();

server.listen(5000, () => console.log("✅ Server running on port 5000"));