const express = require("express");
const router = express.Router();

router.post("/action", (req, res) => {
  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ error: "Data is required" });
  }

  res.json({
    success: true,
    message: `Received data: ${data}`,
  });
});

module.exports = { router };
