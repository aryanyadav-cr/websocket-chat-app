import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Redis } from 'ioredis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const redisUrl = process.env.REDIS_URL;

const redisOptions = {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
};

export const redisPublish = new Redis(redisUrl, redisOptions);
export const redisSubscribe = new Redis(redisUrl, redisOptions);