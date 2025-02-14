const mongoose = require("mongoose");

const KW_KVAHSchema = new mongoose.Schema({
  kw_max: Number,
  kvah_max: Number,
});

// ตรวจสอบว่าโมเดลมีการกำหนดแล้วหรือยัง ถ้ายังไม่มีให้กำหนดใหม่
const KW_KVAH =
  mongoose.models.KW_KVAH_USE || mongoose.model("KW_KVAH_USE", KW_KVAHSchema);

async function Line_graph_data(req, res) {
  try {
    const kw_kvah = await KW_KVAH.find();
    const kw_values = kw_kvah.map((item) => item.kw_max);
    const kvah_values = kw_kvah.map((item) => item.kvah_max);
    // const KW_TS = kw_kvah.kw.map((item) =>
    //   new Date(item.ts).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })
    // );
    // const kw_ts = KW_TS.reverse();
    res.json({ kw_values, kvah_values });
  } catch (error) {
    console.error("Error Line_graph_data:", error.message);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = Line_graph_data;
