require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`API server listening on port ${PORT}`);
    });

    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please stop the process using the port or set PORT to a different value.`);
        process.exit(1);
      }
      console.error('Server error:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

start();
