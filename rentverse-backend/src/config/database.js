const { PrismaClient } = require('@prisma/client');

// Retry configuration for handling transient connection failures
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000; // 2 seconds

// Helper function for delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Initialize Prisma Client with proper configuration
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
  errorFormat: 'pretty',
});

// Wrapper for executing queries with retry logic
async function executeWithRetry(operation, operationName = 'Database operation') {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Only retry on connection errors (P1001, P1002, P1003, P1008, P1010, P1017)
      const retryableCodes = ['P1001', 'P1002', 'P1003', 'P1008', 'P1010', 'P1017'];

      if (retryableCodes.includes(error.code) && attempt < MAX_RETRIES) {
        console.log(`⚠️ ${operationName} failed (attempt ${attempt}/${MAX_RETRIES}): ${error.code}`);
        console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);

        // Try to reconnect
        try {
          await prisma.$disconnect();
          await delay(RETRY_DELAY_MS);
          await prisma.$connect();
          console.log('🔄 Reconnected to database, retrying operation...');
        } catch (reconnectError) {
          console.error('❌ Reconnection failed:', reconnectError.message);
        }
      } else {
        // Non-retryable error or max retries reached
        throw error;
      }
    }
  }

  throw lastError;
}

// Keep-alive ping function
async function pingDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(`💓 Database keep-alive ping successful at ${new Date().toISOString()}`);
    return true;
  } catch (error) {
    console.error(`❌ Database keep-alive ping failed: ${error.message}`);

    // Attempt to reconnect on ping failure
    try {
      await prisma.$disconnect();
      await delay(1000);
      await prisma.$connect();
      console.log('🔄 Reconnected to database after failed ping');
      return true;
    } catch (reconnectError) {
      console.error('❌ Failed to reconnect after ping failure:', reconnectError.message);
      return false;
    }
  }
}

// Start keep-alive interval (ping every 4 minutes)
let keepAliveInterval = null;
const KEEP_ALIVE_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes

function startKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }

  keepAliveInterval = setInterval(async () => {
    await pingDatabase();
  }, KEEP_ALIVE_INTERVAL_MS);

  console.log(`🔄 Database keep-alive started (interval: ${KEEP_ALIVE_INTERVAL_MS / 1000 / 60} minutes)`);
}

function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log('🛑 Database keep-alive stopped');
  }
}

// Handle database connection
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Start keep-alive pinger in production
    if (process.env.NODE_ENV === 'production') {
      startKeepAlive();
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);

    // Retry connection with exponential backoff
    for (let i = 1; i <= MAX_RETRIES; i++) {
      console.log(`⏳ Retrying connection (attempt ${i}/${MAX_RETRIES})...`);
      await delay(RETRY_DELAY_MS * i);

      try {
        await prisma.$connect();
        console.log('✅ Database connected on retry');

        if (process.env.NODE_ENV === 'production') {
          startKeepAlive();
        }
        return;
      } catch (retryError) {
        console.error(`❌ Retry ${i} failed:`, retryError.message);
      }
    }

    console.error('❌ All connection retries failed. Exiting...');
    process.exit(1);
  }
}

// Graceful shutdown
async function disconnectDB() {
  try {
    stopKeepAlive();
    await prisma.$disconnect();
    console.log('👋 Database disconnected');
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
}

module.exports = {
  prisma,
  connectDB,
  disconnectDB,
  executeWithRetry,
  pingDatabase,
  startKeepAlive,
  stopKeepAlive,
};
