const express = require("express");
const app = express();

const cors = require("cors");
const corsOptions = {
  origin: ["localhost:5173"],
};

app.use(cors(corsOptions));

app.get("/api", (req, res) => {
  res.json("Hello test message react+vite+express app");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
