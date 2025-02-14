const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
// ฟังก์ชันโหลด controllers อัตโนมัติ
function importControllers(folderPath) {
  const controllers = {};
  fs.readdirSync(folderPath).forEach((file) => {
    if (file.endsWith(".js")) {
      const moduleName = path.basename(file, ".js"); // นำเข้าเฉพาะไฟล์ .js
      controllers[moduleName] = require(path.join(folderPath, file));
    }
  });

  return controllers;
}
// โหลด controllers ทั้งหมด
const controllers = importControllers(path.join(__dirname, "../controller"));
const preparedata = importControllers(path.join(__dirname, "../prepare_data"));
// ตั้งค่าเส้นทาง API
router.post("/login", preparedata.login);
router.get("/data", controllers.calculate_data);
router.get("/top_ten_usage", controllers.top_ten_usage);
router.get("/graph_data", controllers.graph_data);
router.get("/device_status", controllers.status_device);

module.exports = router;
