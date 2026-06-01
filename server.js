
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store messages in a file (acts as simple database)
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// Initialize messages file if it doesn't exist
if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2));
}

// Helper to read messages
function getMessages() {
  const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
  return JSON.parse(data);
}

// Helper to save messages
function saveMessages(messages) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

 endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Grace Ruge Portfolio API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Get portfolio info
app.get('/api/portfolio', (req, res) => {
  res.json({
    name: 'Grace Ruge',
    title: 'Data Scientist',
    education: 'Eastern Africa Statistical Training Center (EASTC)',
    skills: ['Python', 'R', 'SQL', 'Data Visualization', 'Machine Learning'],
    email: 'graceruge5@gmail.com',
    phone: '+255 616 306 966',
    location: 'Dar es Salaam, Tanzania'
  });
});

// Submit contact message
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  
  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['name', 'email', 'message']
    });
  }
  
  // Email validation (simple)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // Save message
  const messages = getMessages();
  const newMessage = {
    id: Date.now(),
    name,
    email,
    message,
    timestamp: new Date().toISOString(),
    read: false
  };
  
  messages.push(newMessage);
  saveMessages(messages);
  
  console.log(`New message from ${name} (${email})`);
  
  res.json({
    success: true,
    message: `Thank you ${name}! Your message has been received. I will respond within 24 hours.`,
    messageId: newMessage.id
  });
});

// Get all messages (protected - would need auth in production)
app.get('/api/messages', (req, res) => {
  // In production, add authentication here
  const messages = getMessages();
  res.json({
    count: messages.length,
    messages: messages
  });
});

// Get single message
app.get('/api/messages/:id', (req, res) => {
  const messages = getMessages();
  const message = messages.find(m => m.id === parseInt(req.params.id));
  
  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }
  
  res.json(message);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Grace Ruge Portfolio API',
    description: 'Backend API for personal portfolio website',
    endpoints: {
      health: 'GET /api/health',
      portfolio: 'GET /api/portfolio',
      contact: 'POST /api/contact',
      messages: 'GET /api/messages',
      message: 'GET /api/messages/:id'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Grace Ruge Portfolio API running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});
