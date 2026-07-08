import 'dotenv/config';
import app from './app';
import { prisma } from './lib/prisma';
import { createServer } from 'http';
import { initSocket } from './lib/socket';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    // Test database connection
    await prisma.$connect();
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
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⏳ SIGTERM received. Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('⏳ SIGINT received. Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

bootstrap();
