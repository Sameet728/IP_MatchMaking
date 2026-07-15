import 'dotenv/config';
import app from './src/app';
import { db } from './src/lib/db';
import { createServer } from 'http';
import { initSocket } from './src/lib/socket';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    // Test database connection
    const client = await db.connect();
    client.release();
    console.log('✅ Database connected');

    const server = createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 IP COS API running at http://localhost:${PORT}`);
      console.log(`🔌 WebSockets enabled`);
      console.log(`📋 Environment: ${process.env.NODE_ENV}`);
      console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await db.end();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⏳ SIGTERM received. Shutting down...');
  await db.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('⏳ SIGINT received. Shutting down...');
  await db.end();
  process.exit(0);
});

bootstrap();
