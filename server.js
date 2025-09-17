const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
app.use(express.json()); // parse application/json
app.use(express.urlencoded({ extended: true })); // parse form data
app.use(express.text({ type: 'text/plain' }));   // parse plain text
app.use(express.raw({ type: 'application/octet-stream', limit: '5mb' }));

const io = new Server(server);
app.set('trust proxy', true);

io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  socket.on("request_printer_list", (msg) => {
    io.emit("response_printer_list", msg);
  });

  socket.on("broadcast_all_devices", (msg) => {
    io.emit("update_all_device", msg);
  });

  socket.on("request_print_job", (msg) => {
    io.emit("execute_print_job", msg);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

app.post("/api/print", (req, res) => {
  const { type, content, printName } = req.body;

  if (!type || !content) {
    return res.status(400).json({ error: "Missing type or content" });
  }
  io.emit("execute_print_job", { type, content, printName });
  res.json({ success: true });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client.html");
});

server.listen(3000, () => {
  console.log("🚀 Server listening on http://localhost:3000");
});
