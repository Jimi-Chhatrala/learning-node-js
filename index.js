const mongoose = require("mongoose");
const express = require("express");
const fs = require("fs");
const port = 8000;

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/nodejs-mongodb")
  .then(() => console.log("Database Connected"))
  .catch((e) => console.log("Connection Error: ", e));

// User Schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    jobTitle: {
      type: String,
    },
    gender: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("user", userSchema);

// Middleware to log requests
app.use((req, res, next) => {
  fs.appendFile(
    "log.txt",
    `${Date.now()}*${req.ip}*${req.method}*${req.path}\n`,
    (err) => {
      if (err) {
        console.error("Error writing to log file", err);
      }
      next();
    }
  );
});

// Routes
app.get("/", (req, res) => {
  return res.json({ message: "Users Data REST API." });
});

// HTML Response with User List
app.get("/users", async (req, res) => {
  try {
    const allDbUsers = await User.find({});
    const html = `
    <ul>
      ${allDbUsers
        .map((user) => `<li>${user.firstName} - ${user.email}</li>`)
        .join("")}
    </ul>
    `;
    res.send(html);
  } catch (error) {
    res
      .status(500)
      .json({ status: "Error fetching users", error: error.message });
  }
});

// REST API - JSON
app.get("/api/users", async (req, res) => {
  try {
    const allDbUsers = await User.find({});
    return res.json(allDbUsers);
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error fetching users", error: error.message });
  }
});

// Add a new user
app.post("/api/users", async (req, res) => {
  const { firstName, lastName, email, gender, jobTitle } = req.body;
  if (!firstName || !lastName || !email || !gender || !jobTitle) {
    return res.status(400).json({ msg: "All fields are required." });
  }

  try {
    const result = await User.create({
      firstName,
      lastName,
      email,
      gender,
      jobTitle,
    });
    return res
      .status(201)
      .json({ msg: "User created successfully", user: result });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Error creating user", error: error.message });
  }
});

// Routes for specific user operations
app
  .route("/api/users/:id")
  .get(async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ status: "User not found" });
      }
      return res.json(user);
    } catch (error) {
      return res
        .status(500)
        .json({ status: "Error fetching user", error: error.message });
    }
  })
  .patch(async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        return res.status(404).json({ status: "User not found" });
      }

      return res.json({ status: "User updated", user });
    } catch (error) {
      return res
        .status(500)
        .json({ status: "Error updating user", error: error.message });
    }
  })
  .put(async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        overwrite: true,
        runValidators: true,
      });

      if (!user) {
        return res.status(404).json({ status: "User not found" });
      }

      return res.json({ status: "User fully updated", user });
    } catch (error) {
      return res
        .status(500)
        .json({ status: "Error updating user", error: error.message });
    }
  })
  .delete(async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ status: "User not found" });
      }

      return res.json({ status: "User deleted", user });
    } catch (error) {
      return res
        .status(500)
        .json({ status: "Error deleting user", error: error.message });
    }
  });

app.get("/about", (req, res) => {
  return res.send("Hello From About Page");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
