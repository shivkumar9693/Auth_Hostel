const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const AdminKey = require("../models/AdminKeys");


router.get("/",(req,res)=>{
    res.render("home/index.ejs");
})
// Sign-up logic
router.post("/signup", async (req, res) => {
    const {
      firstname,
      lastname,
      email,
      username,
      password,
      role,
      enrollmentNo,
      adminKey,
    } = req.body;
  
    try {
      if (role === "admin") {
        // Check if the admin key exists in the AdminKey collection
        const validAdminKey = await AdminKey.findOne({ key: adminKey });
        if (!validAdminKey) {
          return res.send("Invalid Admin Key");
        }
      } else if (role === "student") {
        // Check if the enrollment number exists
        const validEnrollment = await Enrollment.findOne({
          enrollmentNo: enrollmentNo,
        });
        if (!validEnrollment) {
          return res.send("Enrollment number not found");
        }
      }
  
      // Save the user with firstname, lastname, and email
      const newUser = new User({
        firstname: firstname,
        lastname: lastname,
        email: email,
        username: username,
        password: password, // You should hash the password here for security
        role: role,
        enrollmentNo: role === "student" ? enrollmentNo : undefined,
        adminKey: role === "admin" ? adminKey : undefined,
      });
  
      await newUser.save();
      res.redirect("/signin");
    } catch (err) {
      res.status(500).send("Error signing up: " + err.message);
    }
  });
  
  // Sign-in logic
  // Sign-in logic (FIXED)
router.post("/signin", async (req, res) => {
    const { username, password, role } = req.body;
    
    try {
        const user = await User.findOne({ username, role }); // ✅ Use findOne()
        if (!user) {
            return res.send("Invalid Credentials");
        }

        // ✅ Compare passwords if hashed (use bcrypt in the future)
        if (user.password !== password) {
            return res.send("Invalid Credentials");
        }

        // ✅ Store session data properly
        req.session.user = { _id: user._id, username: user.username, role: user.role };

        // ✅ Redirect to the correct dashboard
        if (role === "admin") {
            res.redirect("/admin/login");
        } else if (role === "student") {
            res.redirect("/student/login");
        }
    } catch (err) {
        res.status(500).send("Error signing in: " + err.message);
    }
});

  
  // Render signup and signin pages
  router.get("/signup", (req, res) => {
    res.render("home/signup");
  });
  
  router.get("/signin", (req, res) => {
    res.render("home/signin");
  });
  
  // Admin page access
  router.get("/admin/login", (req, res) => {
    if (req.session.user && req.session.user.role === "admin") {
      res.send("admin");
    } else {
      res.redirect("/signin");
    }
  });
  
  // Student page access
  router.get("/student/login", (req, res) => {
    if (req.session.user && req.session.user.role === "student") {
        res.render("student/dashboard", { user: req.session.user }); // ✅ Pass user data
    } else {
        res.redirect("/signin");
    }
});

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy(() => {
            res.redirect("/signin");
        });
    });
});
module.exports = router;
 