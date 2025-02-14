// const alarm = require("../prepare_data/alarm");

// async function alarm_device(req, res) {
//   try {
//     const raw_data = await alarm();
//     const Names = raw_data.map((item) => ({
//       originatorName: item.originatorName,
//     }));
//     const Alarms = raw_data.map((item) => ({
//       alarmName: item.name,
//     }));
//     const Device_Names = Names.length;
//     const Device_Alarms = Alarms.length;
//     res.json({ Device_Names, Device_Alarms });
//   } catch (error) {
//     console.log("Error alarm_device: ", error.message);
//   }
// }
// module.exports = alarm_device;
