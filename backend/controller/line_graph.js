const mongoose = require("mongoose");
const ElectricSchema = mongoose.Schema({
  kw_max: Number,
  kvah_max: Number,
  timestamp: { type: Date, default: Date.now },
});
const Electric =
  mongoose.models.kw_kvah_uses ||
  mongoose.model("kw_kvah_uses", ElectricSchema);

async function line_graph(req, res) {
  try {
    const timeframe = req.query.timeframe || "1d";
    let oneDayAgo, sixHoursAgo, oneMonthAgo;
    if (timeframe === "6h") {
      sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    } else if (timeframe === "1M") {
      oneminAgo = new Date(Date.now() - 1 * 60 * 1000);
    } else if (timeframe === "1h") {
      oneHoursAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
    } else if (timeframe === "12h") {
      twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    } else if (timeframe === "1m") {
      oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    } else {
      oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }
    let raw_data;
    if (timeframe === "6h") {
      raw_data = await Electric.find({
        timestamp: { $gte: sixHoursAgo },
      });
    } else if (timeframe === "1M") {
      raw_data = await Electric.find({
        timestamp: { $gte: oneminAgo },
      });
    } else if (timeframe === "1h") {
      raw_data = await Electric.find({
        timestamp: { $gte: oneHoursAgo },
      });
    } else if (timeframe === "12h") {
      raw_data = await Electric.find({
        timestamp: { $gte: twelveHoursAgo },
      });
    } else if (timeframe === "1m") {
      raw_data = await Electric.find({
        timestamp: { $gte: oneMonthAgo },
      });
    } else {
      raw_data = await Electric.find({
        timestamp: { $gte: oneDayAgo },
      });
    }
    const kw = raw_data.map((data) => data.kw_max);
    const kvah = raw_data.map((data) => data.kvah_max);
    const ts = raw_data.map((data) => {
      const date = new Date(data.timestamp);
      return date.toLocaleString("en-GB", { timeZone: "Asia/Bangkok" });
    });
    res.json({ ts, kw, kvah });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

module.exports = line_graph;
