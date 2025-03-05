const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/schedule", (req, res) => {
  setTimeout(() => {
    res.json({ message: "Here is your UNLV schedule" });
  }, 3000); // Delay of 3 seconds
});

app.post("/count", (req, res) => {
  const { count } = req.body;
  if (count) {
    res.json({ message: count * count });
  } else {
    res.status(400).json({ message: "Count is required" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
