async function login(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const user = "admin";
  const pass = "admin";
  if (username === user && password === pass) {
    res.json({ success: true, message: "Login successful" });
  } else {
    res.json({
      success: false,
      message: "Invalid username or password",
    });
  }
}

module.exports = login;
