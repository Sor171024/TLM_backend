const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "tlm_db",
});

connection.connect((error) => {
  if (error) {
    console.log("Error connect:", error.message);
    return;
  }
  console.log("Connect success");
});

async function get_data_timeseries() {
  try {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          t.Meter_Name,
          m.mea_area AS MEA_Area,  -- ดึงค่าจริงจาก mea_area
          t.MEA_No,
          l.location AS Location,  -- ดึงค่าจริงจาก location
          t.Installation
        FROM tlm_data t
        JOIN mea_area m ON t.MEA_Area = m.id_mea_area  -- เชื่อมตาราง mea_area
        JOIN location l ON t.Location = l.id_location;  -- เชื่อมตาราง location
      `;

      connection.query(query, (err, result) => {
        if (err) {
          console.log("Error fetching data:", err.message);
          reject(err);
        } else {
          resolve(result); // ส่งข้อมูลกลับ
        }
      });
    });
  } catch (error) {
    console.log("ERROR get_data function", error.message);
  }
}

module.exports = get_data_timeseries;
