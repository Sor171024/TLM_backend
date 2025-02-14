const mongoose = require("mongoose");

const eventTypeSchema = new mongoose.Schema({
  Name: String,
  Value: String,
  createdAt: Date,
  updatedAt: Date,
});
const EventType = mongoose.model("values", eventTypeSchema);

const ElectricSchema = new mongoose.Schema({
  kw_max_day: Number,
  kvah_max_day: Number,
});
const Electric = mongoose.model("electric_use_days", ElectricSchema);

const KW_KVAHSchema = new mongoose.Schema({
  kw_max: Number,
  kvah_max: Number,
});
const KW_KVAH = mongoose.model("KW_KVAH_USE", KW_KVAHSchema);
async function calculate_data(req, res) {
  try {
    const Device_data = await EventType.find();

    const devices = Device_data.map((device) => ({
      name: device.Name,
      value: JSON.parse(device.Value),
    }));

    const kw = devices.map((device) => device.value.P_TOT);
    const kvah = devices.map((device) => device.value.Q_TOT);

    const kw_max = Math.max(...kw);
    const kvar_max = Math.max(...kvah);
    // await KW_KVAH.findOneAndUpdate(
    //   { kw_max: kw_max },
    //   { kvah_max: kvar_max },
    //   { new: true, upsert: true }
    // );
    await KW_KVAH.findOneAndUpdate(
      { kw_max: kw_max },
      {
        kvah_max: kvar_max,
        timestamp: new Date(), // 🔹 บันทึกเวลาปัจจุบันของเครื่อง localhost
      },
      { new: true, upsert: true }
    );

    const Electric_data = await Electric.find();
    const kw_max_day =
      Electric_data.length > 0 ? Electric_data[0].kw_max_day : 0;
    const kvar_max_day =
      Electric_data.length > 0 ? Electric_data[0].kvah_max_day : 0;
    // Check if new max values are greater than stored values
    if (kw_max > kw_max_day) {
      await Electric.findOneAndUpdate(
        {},
        { kw_max_day: kw_max },
        { upsert: true, new: true }
      );
    }

    if (kvar_max > kvar_max_day) {
      await Electric.findOneAndUpdate(
        {},
        { kvah_max_day: kvar_max },
        { upsert: true, new: true }
      );
    }

    res.json({
      kw_max,
      kvar_max,
      kw_max_day,
      kvar_max_day,
    });
  } catch (error) {
    console.error("ERROR calculate function", error.message);
    res.status(500).json({ error: error.message });
  }
}

module.exports = calculate_data;
