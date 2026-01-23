const express = require('express');
require('dotenv').config();
let mongoose = require("mongoose")
const userRouter = require("./routes/userRoute")
const equipmentRouter = require("./routes/equipmentRoute")
const bookingRouter = require("./routes/bookingRoute")
const reviewRouter = require("./routes/reviewRoute")
const messageRouter = require("./routes/messageRoute")
const adminRouter = require("./routes/adminRoute")
const { Server } = require("socket.io");
const http = require("http");
const Message = require("./models/message");
const mapRoutes = require("./routes/mapRoutes");
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for now, restrict in production
        methods: ["GET", "POST"]
    },
    transports: ["polling", "websocket"],
    allowEIO3: true
});

const PORT = process.env.PORT || 8000;
let cors = require('cors')

let corsOption = {
    origin: '*',
}

app.set("trust proxy", 1);
app.use(cors(corsOption))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Make io available in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://hack:agri123@cluster0.ngajkc1.mongodb.net/?appName=Cluster0")
    .then(() => {
        console.log("DB connected successfully.");
    })
    .catch((e) => {
        console.log(e);
    })

app.get("/", (req, res) => {
    res.send("hello")
})

app.use("/", userRouter)
app.use("/", equipmentRouter)
app.use("/", bookingRouter)
app.use("/", reviewRouter)
app.use("/", messageRouter)
app.use("/", adminRouter)
app.use("/", mapRoutes);
// Socket.IO Logic
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join_room", (userId) => {
        socket.join(userId);
        console.log(`User with ID: ${socket.id} joined room: ${userId}`);
    });

    socket.on("send_message", async (data) => {
        const { sender_id, receiver_id, message, booking_id } = data;

        // Save to DB
        try {
            const newMessage = await Message.create({
                sender_id,
                receiver_id,
                content: message,
                booking_id
            }); // .populate if needed, but for emission maybe raw is fine or just acknowledge

            // Emit to receiver
            io.to(receiver_id).emit("receive_message", newMessage);
            // Emit back to sender (optional, if frontend doesn't optimistically update)
            io.to(sender_id).emit("receive_message", newMessage);

            // Notification
            io.to(receiver_id).emit("notification", {
                type: "message",
                content: `New message from sender`, // meaningful name requires populate
                data: newMessage
            });

        } catch (e) {
            console.error("Socket message error:", e);
        }
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});

const disputeRouter = require("./routes/disputeRoute")
const chatbotRouter = require("./routes/chatbotRoute");

// ... (other middlewares)

app.use("/", disputeRouter)
app.use("/", chatbotRouter);

const aiRouter = require("./routes/aiRoutes");
app.use("/", aiRouter);
app.use("/api/map", mapRoutes);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message
    });
});

app.get('/api/activate', (req, res) => {
    res.json({ message: 'Hello from the server!' });
});
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
