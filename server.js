/**
 * StaySimple Backend API
 * 
 * To run this server:
 * 1. Initialize a new node project: `npm init -y`
 * 2. Install dependencies: `npm install express cors body-parser`
 * 3. Run: `node server.js`
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- Mock Database (In-Memory) ---
let rooms = [
  {
    id: 'r1',
    name: 'Cozy Standard',
    type: 'Standard',
    price: 99,
    capacity: 2,
    description: 'A comfortable room perfect for solo travelers or couples.',
    amenities: ['Wifi', 'TV', 'Coffee Maker'],
    imageUrl: 'https://picsum.photos/800/600?random=1',
    rating: 4.5,
    reviews: 124
  },
  // ... (Full list would go here in prod)
];

let bookings = [];
let users = [
    {
        id: 'admin1',
        name: 'Hotel Manager',
        email: 'admin@staysimple.com',
        password: 'admin123', // In production, hash this!
        role: 'admin'
    }
];

// --- Helper Functions ---
const checkAvailability = (roomId, start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return !bookings.some(b => {
        if (b.roomId !== roomId || b.status === 'cancelled') return false;
        const bStart = new Date(b.startDate);
        const bEnd = new Date(b.endDate);
        return startDate < bEnd && endDate > bStart;
    });
};

// --- Routes ---

// Auth Routes
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const { password: _, ...userWithoutPass } = user;
    res.json(userWithoutPass);
});

app.post('/api/auth/signup', (req, res) => {
    const { name, email, password } = req.body;
    
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = {
        id: `usr_${Date.now()}`,
        name,
        email,
        password,
        role: 'customer'
    };
    
    users.push(newUser);
    const { password: _, ...userWithoutPass } = newUser;
    res.status(201).json(userWithoutPass);
});

// Room Routes
app.get('/api/rooms', (req, res) => {
    res.json(rooms);
});

app.post('/api/rooms', (req, res) => {
    // Admin check middleware would go here
    const newRoom = { ...req.body, id: `r_${Date.now()}`, rating: 0, reviews: 0 };
    rooms.push(newRoom);
    res.status(201).json(newRoom);
});

// Booking Routes
app.get('/api/bookings', (req, res) => {
    // In real app, filter by user unless admin
    res.json(bookings);
});

app.post('/api/bookings', (req, res) => {
    const { roomId, startDate, endDate, userId, guestName, totalPrice, addons } = req.body;
    
    if (!checkAvailability(roomId, startDate, endDate)) {
        return res.status(409).json({ message: 'Room not available for selected dates' });
    }

    const newBooking = {
        id: `bk_${Date.now()}`,
        roomId,
        userId,
        guestName,
        startDate,
        endDate,
        addons: addons || [],
        totalPrice,
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };

    bookings.push(newBooking);
    res.status(201).json(newBooking);
});

app.patch('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const booking = bookings.find(b => b.id === id);
    if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    res.json(booking);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});