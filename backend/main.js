const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { readdirSync } = require("fs");
const PORT = 8080;
const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
// getToken();
readdirSync("./routes").map((r) => app.use("/api", require("./routes/" + r)));

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`, new Date().toLocaleString());
});
