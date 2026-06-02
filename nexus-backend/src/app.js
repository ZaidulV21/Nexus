// nexus-backend/src/app.js

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const sgMail = require("@sendgrid/mail");

const app = express();
app.set("trust proxy", 1);   // ✅ Add this line

// ==============================
// SENDGRID CONFIG
// ==============================
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ==============================
// MIDDLEWARE
// ==============================
app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// ==============================
// RATE LIMITERS
// ==============================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 500 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests, please try again later.",
  },
});

app.use("/api/", limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 50 : 20,
  message: {
    error: "Too many login attempts, please try again later.",
  },
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ==============================
// LOGGER
// ==============================
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ==============================
// BODY PARSER
// ==============================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ==============================
// HEALTH ROUTE
// ==============================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// ==============================
// EMAIL ROUTE
// ==============================
app.post("/api/send-email", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const msg = {
      to: "yourgmail@gmail.com", // CHANGE THIS
      from: process.env.EMAIL_FROM,
      subject: `New Contact Form Message from ${name}`,

      text: `
Name: ${name}
Email: ${email}
Message: ${message}
      `,

      html: `
        <h2>New Contact Message</h2>

        <p>
          <strong>Name:</strong> ${name}
        </p>

        <p>
          <strong>Email:</strong> ${email}
        </p>

        <p>
          <strong>Message:</strong>
        </p>

        <p>${message}</p>
      `,
    };

    await sgMail.send(msg);

    console.log("✅ Email Sent");

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });

  } catch (error) {

    console.log("❌ SENDGRID ERROR:");
    console.log(error.response?.body || error);

    res.status(500).json({
      success: false,
      message: "Email failed",
    });
  }
});

// ==============================
// ROUTES
// ==============================
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/services", require("./routes/services.routes"));
app.use("/api/enquiries", require("./routes/enquiries.routes"));
app.use("/api/projects", require("./routes/projects.routes"));
app.use("/api/milestones", require("./routes/milestones.routes"));
app.use("/api/quotes", require("./routes/quotes.routes"));
app.use("/api/invoices", require("./routes/invoices.routes"));
app.use("/api/documents", require("./routes/documents.routes"));
app.use("/api/messages", require("./routes/messages.routes"));
app.use("/api/admin", require("./routes/admin.routes"));

// ==============================
// 404 HANDLER
// ==============================
app.use((req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ==============================
// ERROR HANDLER
// ==============================
app.use(require("./middleware/errorHandler"));

module.exports = app;