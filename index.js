const express = require("express");
const users = require("./MOCK_DATA.json");
const fs = require("fs");
const { error } = require("console");
const port = 8000;

const app = express();

// Middleware - Plugin
app.use(express.urlencoded({ extended: false }));

// Routes

app.get("/", (req, res) => {
  return res.json({ message: "Users Data REST API." });
});

app.get("/users", (req, res) => {
  const html = `
  <ul>
    ${users.map((user) => `<li>${user.first_name}</li>`).join("")}
  </ul>
  `;
  res.send(html);
});

// REST API - JSON

app.get("/api/users", (req, res) => {
  return res.json(users);
});

// Add a new user
app.post("/api/users", (req, res) => {
  const body = req.body;
  const newUser = { ...body, id: users.length + 1 };
  users.push(newUser);

  fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err) => {
    if (err) {
      return res.status(500).json({ status: "Failed to add user", error: err });
    }
    return res.json({ status: "New user added.", id: newUser.id });
  });
});

app
  .route("/api/users/:id")
  .get((req, res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    if (!user) {
      return res.status(404).json({ status: "User not found" });
    }
    return res.json(user);
  })
  .patch((req, res) => {
    const id = Number(req.params.id);
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ status: "User not found" });
    }

    // Merge the existing user with the new data (partial update)
    users[userIndex] = { ...users[userIndex], ...req.body };
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err) => {
      if (err) {
        return res
          .status(500)
          .json({ status: "Failed to update user", error: err });
      }

      return res.json({ status: "User updated", user: users[userIndex] });
    });
  })
  .put((req, res) => {
    const id = Number(req.params.id);
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ status: "User not found" });
    }

    // Completely replace the user object
    users[userIndex] = { ...req.body, id };

    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err) => {
      if (err) {
        return res
          .status(500)
          .json({ status: "Failed to update user", error: err });
      }
      return res.json({ status: "User fully updated", user: users[userIndex] });
    });
  })
  .delete((req, res) => {
    const id = Number(req.params.id);
    console.log(id);
    const userIndex = users.findIndex((user) => user.id === id);
    console.log(userIndex);
    if (userIndex === -1) {
      return res.status(404).json({ status: "User not found" });
    }

    // Remove the user from the array
    const deletedUser = users.splice(userIndex, 1)[0];

    fs.writeFile("./MOCK_DAT.json", JSON.stringify(users), (err) => {
      if (err) {
        return res
          .status(500)
          .json({ status: "Failed to delete user", error: err });
      }
      return res.json({ status: "User deleted", user: deletedUser });
    });
  });

app.get("/about", (req, res) => {
  return res.send("Hello From About Page");
});

app.listen(8000, () => console.log("Serving..."));
