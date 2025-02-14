const get_data_timeseries = require("../prepare_data/get_data_timeseries");
const mongoose = require("mongoose");

// ตรวจสอบโมเดลก่อนสร้าง
const value_data =
  mongoose.models.values ||
  mongoose.model(
    "values",
    new mongoose.Schema({
      Name: String,
      Value: String,
      createdAt: Date,
      updatedAt: Date,
    })
  );

async function top_ten_usage(req, res) {
  try {
    // ดึงข้อมูล transformedData
    const data = await get_data_timeseries();
    const transformedData = data.map((item) => ({
      Name: item.Meter_Name,
      MEA_Area: item.MEA_Area,
      MEA_No: item.MEA_No,
      Installation: item.Installation,
      Location: item.Location,
    }));

    // สร้าง Map สำหรับการจับคู่ข้อมูลจาก transformedData โดยอ้างอิงจาก Name
    const dataMap = {};
    transformedData.forEach((item) => {
      dataMap[item.Name] = {
        MEA_No: item.MEA_No,
        MEA_Area: item.MEA_Area,
        Location: item.Location,
        Installation: item.Installation,
      };
    });

    // ดึงข้อมูลจาก value_data
    const Device_data = await value_data.find();
    const devices = Device_data.map((device) => ({
      name: device.Name,
      value: JSON.parse(device.Value),
    }));

    // ดึงค่า KWH_TOT และ P_TOT จาก devices
    const kwhOnly = devices.map((item) => ({
      name: item.name,
      kwh: item.value.KWH_TOT,
      kw: item.value.P_TOT,
      MEA_No: dataMap[item.name]?.MEA_No || "N/A", // ถ้าไม่พบค่าให้ใส่ N/A
      MEA_Area: dataMap[item.name]?.MEA_Area || "N/A",
      Location: dataMap[item.name]?.Location || "N/A",
      // แปลงวันที่จาก UTC เป็นวันที่ใน format ที่ต้องการ
      Instal_date: dataMap[item.name]?.Installation
        ? new Date(dataMap[item.name]?.Installation).toLocaleDateString("en-GB") // ใช้ en-GB สำหรับรูปแบบ dd/mm/yyyy
        : "N/A",
    }));

    // เรียงลำดับจาก KWH_TOT และเลือก 10 อันดับแรก
    const sortedData = kwhOnly.sort((a, b) => b.kwh - a.kwh).slice(0, 10);

    // ดึงข้อมูลที่ต้องการ
    const Name = sortedData.map((item) => item.name);
    const KWH = sortedData.map((item) => item.kwh);
    const KW = sortedData.map((item) => item.kw);
    const MEA_NO = sortedData.map((item) => item.MEA_No);
    const MEA_AREA = sortedData.map((item) => item.MEA_Area);
    const Location = sortedData.map((item) => item.Location);
    const Instal_date = sortedData.map((item) => item.Instal_date);

    res.json({
      Name,
      KWH,
      KW,
      MEA_NO,
      MEA_AREA,
      Location,
      Instal_date,
    });
  } catch (error) {
    console.log("ERROR TOP_TEN_USAGE function", error.message);
    res.status(500).json({ error: error.message });
  }
}

module.exports = top_ten_usage;
