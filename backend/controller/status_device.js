const graph_status = require("../prepare_data/graph_status");
const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/TLM");
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

const eventTypeSchema = new mongoose.Schema({
  Name: String,
  detail: {
    Event_type: String,
    Severity: String,
  },
  createdAt: Date,
  updatedAt: Date,
});
async function device_status(req, res) {
  try {
    const status = await graph_status();
    const total = status.length;
    const online = [];
    const offline = [];
    status.forEach((item) => {
      if (item.Meter_Status === "online") {
        online.push(item.Name);
      } else if (item.Meter_Status === "offline") {
        offline.push(item.Name);
      } else {
        return;
      }
    });
    const onlinePercent = ((online.length / total) * 100).toFixed(2);
    const offlinePercent = ((offline.length / total) * 100).toFixed(2);
    const totalonline = online.length;
    const totaloffline = offline.length;
    /*-----------------------------------------------------------------*/

    const EventType = mongoose.model("events", eventTypeSchema);
    const events = await EventType.find();
    const Device_Alarms = events.length;
    res.json({
      Device_Alarms,
      totalonline,
      totaloffline,
      onlinePercent,
      offlinePercent,
    });
  } catch (error) {
    console.log(error);
  }
}
module.exports = device_status;
