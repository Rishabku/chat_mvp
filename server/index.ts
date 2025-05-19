const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const { createServer } = require('http'); 
 
const app = express();

app.use(cors());
 
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
 
io.on('connection', (socket: any) => {
  console.log('User connected:', socket.id);
 
  socket.on('user-message', (msg: any) => {
    console.log('User:', msg);
    socket.broadcast.emit('user-message', msg); // forward to agent
  });
 
  socket.on('agent-message', (msg: any) => {
    console.log('Agent:', msg);
    socket.broadcast.emit('agent-message', msg); // forward to user
  });
 
  socket.on('typing', (from: any) => {
    socket.broadcast.emit('typing', from);
  });

  // Streaming messages
  socket.on('start-stream', (streamId: string) => {
    console.log('Stream started:', streamId);
    socket.broadcast.emit('stream-start', streamId);
  });

  socket.on('stream-chunk', ({ streamId, chunk, isLast }: { streamId: string, chunk: string, isLast: boolean }) => {
    console.log('Stream chunk:', chunk);
    socket.broadcast.emit('stream-chunk', { 
      streamId, 
      chunk, 
      isLast 
    });
  });

});
 
httpServer.listen(3002, () => {
  console.log('Server running on http://localhost:3002');
});