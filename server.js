import express from "express";
import http from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid"; //? universally unique id
import { ExpressPeerServer } from "peer";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
//? // ?MVC model veiw control
app.set("view engine", "ejs"); // ?
// ?  ejs =embebeded javasscript  view engien JAVASCRIPT
app.use(express.static("public")); //? FOR CSS

const peerServer = ExpressPeerServer(server, {
  debug: true,
});
app.use("/peerjs", peerServer);


app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    // console.log(`Mesay joined room ${roomId}`);
    socket.to(roomId).emit("user-connected", userId);

    //         //? send message to the same room

    socket.on("disconnect", () => {
      console.log("A user disconnected");
      socket.to(roomId).emit("A user disconnected", userId);
    });
  });
});

// Start the server

 server.listen(process.env.PORT || 3000)