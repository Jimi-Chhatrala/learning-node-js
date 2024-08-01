const express = require("express");
const users = require("./MOCK_DATA.json");

const app = express();

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

app.post("/api/users", (req, res) => {
  // TODO: Create new user
  return res.json({ status: "Pending" });
});

app
  .route("/api/users/:id")
  .get((req, res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    return res.json(user);
  })
  .patch((req, res) => {
    // TODO: Edit partial info of the user  with id
    return res.json({ status: "Pending" });
  })
  .put((req, res) => {
    // TODO: Edit whole info of the user  with id
    return res.json({ status: "Pending" });
  })
  .delete((req, res) => {
    // TODO: Delete the user with id
    return res.json({ status: "Pending" });
  });

app.get("/about", (req, res) => {
  return res.send("Hello From About Page");
});

app.listen(8000, () => console.log("Serving..."));
