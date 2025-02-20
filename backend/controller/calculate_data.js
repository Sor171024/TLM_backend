// const mongoose = require("mongoose");
// const moment = require("moment-timezone");

// const eventTypeSchema = new mongoose.Schema({
//   Name: String,
//   Value: String,
//   createdAt: Date,
//   updatedAt: Date,
// });
// const EventType = mongoose.model("values", eventTypeSchema);

// const ElectricSchema = new mongoose.Schema({
//   kw_max_day: Number,
//   kvah_max_day: Number,
//   timestamp: { type: Date, default: Date.now },
// });
// const Electric = mongoose.model("electric_use_days", ElectricSchema);

// const KW_KVAHSchema = new mongoose.Schema({
//   kw_max: Number,
//   kvah_max: Number,
//   timestamp: { type: Date, default: Date.now },
// });
// const KW_KVAH = mongoose.model("KW_KVAH_USE", KW_KVAHSchema);

// async function calculate_data(req, res) {
//   try {
//     const Device_data = await EventType.find();
//     const devices = Device_data.map((device) => ({
//       name: device.Name,
//       value: JSON.parse(device.Value),
//     }));
//     const kw = devices.map((device) => device.value.P_TOT);
//     const kvah = devices.map((device) => device.value.Q_TOT);
//     const kw_max = Math.max(...kw);
//     const kvar_max = Math.max(...kvah);
//     setInterval(async () => {
//       const latestKWKVAH = await KW_KVAH.findOne().sort({ timestamp: -1 });
//       if (latestKWKVAH) {
//         if (
//           kw_max !== latestKWKVAH.kw_max ||
//           kvar_max !== latestKWKVAH.kvah_max
//         ) {
//           await KW_KVAH.create({
//             kw_max: kw_max,
//             kvah_max: kvar_max,
//             timestamp: new Date(),
//           });
//           console.log("บันทึกข้อมูลใหม่เรียบร้อย");
//         } else {
//           console.log("ข้อมูลไม่มีการเปลี่ยนแปลง");
//         }
//       } else {
//         await KW_KVAH.create({
//           kw_max: kw_max,
//           kvah_max: kvar_max,
//           timestamp: new Date(),
//         });
//       }
//     }, 300000);

//     const Electric_data = await Electric.find();
//     const kw_max_day =
//       Electric_data.length > 0 ? Electric_data[0].kw_max_day : 0;
//     const kvar_max_day =
//       Electric_data.length > 0 ? Electric_data[0].kvah_max_day : 0;

//     if (kw_max > kw_max_day) {
//       await Electric.findOneAndUpdate(
//         {},
//         { kw_max_day: kw_max, timestamp: new Date() }, // ใช้เวลาปัจจุบัน
//         { upsert: true, new: true }
//       );
//     }

//     if (kvar_max > kvar_max_day) {
//       await Electric.findOneAndUpdate(
//         {},
//         { kvah_max_day: kvar_max, timestamp: new Date() }, // ใช้เวลาปัจจุบัน
//         { upsert: true, new: true }
//       );
//     }
//     res.json({
//       kw_max,
//       kvar_max,
//       kw_max_day,
//       kvar_max_day,
//     });
//   } catch (error) {
//     console.error("ERROR calculate function", error.message);
//     res.status(500).json({ error: error.message });
//   }
// }

// module.exports = calculate_data;
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
  timestamp: { type: Date, default: Date.now },
});
const Electric = mongoose.model("electric_use_days", ElectricSchema);

const KW_KVAHSchema = new mongoose.Schema({
  kw_max: Number,
  kvah_max: Number,
  timestamp: { type: Date, default: Date.now },
});
const KW_KVAH = mongoose.model("KW_KVAH_USE", KW_KVAHSchema);

// ฟังก์ชันสำหรับคำนวณและบันทึกข้อมูล
async function calculateAndSaveData() {
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

    const latestKWKVAH = await KW_KVAH.findOne().sort({ timestamp: -1 });
    if (
      !latestKWKVAH ||
      kw_max !== latestKWKVAH.kw_max ||
      kvar_max !== latestKWKVAH.kvah_max
    ) {
      await KW_KVAH.create({
        kw_max: kw_max,
        kvah_max: kvar_max,
        timestamp: new Date(),
      });
      console.log("บันทึกข้อมูลใหม่เรียบร้อย");
    } else {
      console.log("ข้อมูลไม่มีการเปลี่ยนแปลง");
    }

    const Electric_data = await Electric.find();
    const kw_max_day =
      Electric_data.length > 0 ? Electric_data[0].kw_max_day : 0;
    const kvar_max_day =
      Electric_data.length > 0 ? Electric_data[0].kvah_max_day : 0;

    if (kw_max > kw_max_day) {
      await Electric.findOneAndUpdate(
        {},
        { kw_max_day: kw_max, timestamp: new Date() },
        { upsert: true, new: true }
      );
    }

    if (kvar_max > kvar_max_day) {
      await Electric.findOneAndUpdate(
        {},
        { kvah_max_day: kvar_max, timestamp: new Date() },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error("ERROR calculate function", error.message);
  }
}

// เรียกใช้ calculateAndSaveData ทุกๆ 5 นาที
setInterval(calculateAndSaveData, 300000);

// API สำหรับเรียกดูข้อมูลล่าสุด
async function calculate_data(req, res) {
  try {
    const latestData = await KW_KVAH.findOne().sort({ timestamp: -1 });
    const latestElectric = await Electric.findOne();

    res.json({
      kw_max: latestData ? latestData.kw_max : null,
      kvar_max: latestData ? latestData.kvah_max : null,
      kw_max_day: latestElectric ? latestElectric.kw_max_day : null,
      kvar_max_day: latestElectric ? latestElectric.kvah_max_day : null,
    });
  } catch (error) {
    console.error("ERROR calculate function", error.message);
    res.status(500).json({ error: error.message });
  }
}

module.exports = calculate_data;
