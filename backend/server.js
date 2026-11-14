import { WebSocketServer, WebSocket } from 'ws';
import fs from 'fs/promises';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { redisPublish, redisSubscribe } from './connection.js';

const PORT = process.env.PORT || 8080;
const REDIS_CHANNEL = 'wss-messages';
const userOnline = new Map();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
};

const httpServer = http.createServer(async (req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            success: true,
            message: 'Backend is connected',
            timestamp: new Date().toISOString()
        }));
        return;
    }

    try {
        const indexPath = path.join(rootDir, 'index.html');
        const indexFile = await fs.readFile(indexPath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(indexFile);
    } catch (error) {
        console.error('Failed to read index.html:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Server error');
    }
});

const wss = new WebSocketServer({ server: httpServer });

const broadcast = (message) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
};

await redisSubscribe.subscribe(REDIS_CHANNEL);

redisSubscribe.on('message', (channelName, message) => {
    if (channelName === REDIS_CHANNEL) {
        console.log('Message received from Redis:', message);
        broadcast(message.toString());
    }
});

wss.on('connection', (webSocket) => {
    console.log('WebSocket connection established....');

    const username = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    userOnline.set(username, webSocket);

    console.log(`${username} is ONLINE`);
    console.log('Local online users:', [...userOnline.keys()]);

    const onlineMessage = JSON.stringify({
        type: 'user_online',
        username: username,
        users: [...userOnline.keys()]
    });

    redisPublish.publish(REDIS_CHANNEL, onlineMessage);

    webSocket.on('message', async (data) => {
        const rawMessage = data.toString();
        console.log('WebSocket Message Received:', rawMessage);

        let parsed;

        try {
            parsed = JSON.parse(rawMessage);
        } catch (error) {
            console.log('Invalid JSON message');
            return;
        }

        const outgoingMessage = JSON.stringify({
            type: 'message',
            username: username,
            message: parsed.message ?? rawMessage
        });

        console.log('Publishing message to Redis...');
        await redisPublish.publish(REDIS_CHANNEL, outgoingMessage);
    });


    // ==========================================
    // USER DISCONNECT
    // ==========================================

    webSocket.on(
        'close',
        async () => {

            console.log(
                `${username} disconnected`
            );


            // Remove from local Map
            userOnline.delete(username);


            console.log(
                `${username} is OFFLINE`
            );


            console.log(
                'Local online users:',
                [...userOnline.keys()]
            );


            const offlineMessage =
                JSON.stringify({

                    type: 'user_offline',

                    username: username,
                    users: [...userOnline.keys()]

                });


            // IMPORTANT:
            // Publish to Redis so other servers
            // also receive the offline event.

            await redisPublish.publish(
                REDIS_CHANNEL,
                offlineMessage
            );

        }
    );


    // ==========================================
    // ERROR
    // ==========================================

    webSocket.on(
        'error',
        (error) => {

            console.log(
                'WebSocket Error:',
                error
            );

        }
    );

});


// ==========================================
// START SERVER
// ==========================================

httpServer.listen(
    PORT,
    () => {

        console.log(
            `Server listening on port ${PORT}`
        );

    }
);