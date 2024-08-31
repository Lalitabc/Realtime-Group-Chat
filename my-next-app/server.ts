// server.ts
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import next from 'next';
import express from 'express';

const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const server = createServer(expressApp);
  const io = new SocketIOServer(server);
  const roomsName = new Map();
  let chatSave = new Map();
  // Handle socket.io connections
  io.on('connection', (socket) => {
    console.log("Socket connected:", socket.id);

    // Create or join a room
    socket.on('joinRoom', (roomName) => {
      socket.join(roomName);

      // Initialize the room with an empty array if it doesn't exist
      if (!roomsName.has(roomName)) {
        roomsName.set(roomName, []);
        chatSave.set(roomName, "");
      }

      // Add the socket ID to the array of the room
      roomsName.get(roomName).push(socket.id);
      console.log(`Socket ${socket.id} joined room ${roomName}`);
      // console.log("Current rooms:", roomsName);

      const roomsNameArray = roomsName.get(roomName);

      // if (roomsNameArray) {
      //     roomsNameArray.forEach(socketId => {
      //         io.to(socketId).emit("newJoin", socket.id);
      //     });
      // }  
      io.to(socket.id).emit("newJoin", chatSave.get(roomName));

    });



    // Handle chat messages
    socket.on("chat", (payload) => {
      console.log(`Received chat in room ${payload.roomName}:`, payload.chat);
      if (!chatSave.has(payload.roomName)) {
        chatSave.set(payload.roomName, "");
      }
      chatSave.set(payload.roomName, payload.chat)
      const roomNameClient = payload.roomName;
      const roomsNameArray = roomsName.get(roomNameClient);

      if (roomsNameArray) {
        roomsNameArray.forEach((socketId: string) => {
          io.to(socketId).emit("chat", payload.chat);
        });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);

      // Remove socket ID from all rooms
      roomsName.forEach((sockets, roomName) => {
        const index = sockets.indexOf(socket.id);
        if (index !== -1) {
          sockets.splice(index, 1);
          console.log(`Socket ${socket.id} removed from room ${roomName}`);
        }

        // Clean up the room if it's empty
        if (sockets.length === 0) {
          roomsName.delete(roomName);
          console.log(`Room ${roomName} is empty and has been deleted`);
        }
      });

      console.log("Current rooms after disconnect:", roomsName);
    });
  });

  expressApp.all('*', (req, res) => handle(req, res));

  server.listen(3000, (err?: any) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});














