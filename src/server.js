import express from "express";
import http from "http";
import WebSocket from "ws";
import SocketIO from "socket.io";
const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => {
  res.render("home");
});
app.get("/*", (req, res) => {
  res.redirect("/");
});
const handleListen = () => {
  console.log("Listening on http://localhost:3000");
};
// app.listen(3000, handleListen);
// const wss = new WebSocket.Server({ server });
// wss.on("connection", (socket) => {
//   socket.on("close", () => {
//     console.log("disconnected from browser");
//   });
//   socket.send("Connected to browser");
// });

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anon";
  socket.on("enter_room", (roomName, showRoom) => {
    // console.log(socket.rooms);
    socket.join(roomName);
    // console.log(socket.rooms);
    showRoom();
    socket.to(roomName).emit("welcome", socket.nickname);
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname)
    );
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on("nickname", (nickname) => {
    socket["nickname"] = nickname;
  });
});
httpServer.listen(3000, handleListen);
