const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const MongoStore = require("connect-mongo");

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 180000 } // 3 minutes in milliseconds
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Passport Configuration
require("./config/passport")(passport);

// Authentication Middleware
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/signin");
}

// Auto Logout on Background
app.use((req, res, next) => {
    if (req.isAuthenticated() && req.session) {
        req.session.lastActivity = Date.now();
    }
    next();
});

setInterval(() => {
    app.use((req, res, next) => {
        if (req.isAuthenticated() && req.session.lastActivity) {
            if (Date.now() - req.session.lastActivity > 180000) { // 3 minutes
                req.logout();
                req.session.destroy();
            }
        }
        next();
    });
}, 60000); // Check every 1 minute

// Routes
app.use("/", authRoutes);

// Protected Routes
app.get("/admin", ensureAuthenticated, (req, res) => {
    if (req.user.role === "admin") {
        res.render("admin/dashboard");
    } else {
        res.redirect("/");
    }
});

app.get("/student", ensureAuthenticated, (req, res) => {
    if (req.user.role === "student") {
        res.render("student/dashboard");
    } else {
        res.redirect("/");
    }
});

// Home route
app.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.role === "admin") {
            return res.redirect("/admin");
        } else if (req.user.role === "student") {
            return res.redirect("/student");
        }
    }
    res.render("home/index");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
