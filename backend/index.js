const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const cors = require('cors');

const path = require('path');

const connectDB = require('./lib/db');
const { app, server  } =  require('./lib/socket')

const authRoutes = require('./routes/authRouter');
const messageRoutes = require('./routes/messageRouter');

dotenv.config();


const PORT = process.env.PORT;


app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);


if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, "../frontend/dist")))
}

app.get("*" , (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
})

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDB();
});  