const express = require("express");
const http = require("http");
const readline = require("readline");
const { WebSocketServer } = require("ws");

// Configuration : Port 5050 unique
const PORT = process.env.PORT || 5050;

const app = express();
const server = http.createServer(app);

// --- Middlewares Express ---

// Middleware CORS
app.use((req, res, next) => {
    const origin = req.headers["origin"] || "*";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, X-Local-Token"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
});

// Middleware pour parser les corps de requêtes JSON et formulaires URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Configuration WebSocket (sur /ws) ---

// noServer: true permet de gérer le Handshake manuellement
const wss = new WebSocketServer({ noServer: true });
const clients = new Set();
let clientCount = 0;

// Interception des requêtes de mise à niveau HTTP vers WebSocket sur /ws
server.on("upgrade", (request, socket, head) => {
    const { pathname } = new URL(request.url, `http://${request.headers.host}`);

    if (pathname === "/ws") {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit("connection", ws, request);
        });
    } else {
        // Rejette les tentatives WebSocket sur d'autres routes
        socket.destroy();
    }
});

wss.on("connection", (ws, req) => {
    clientCount++;
    const ip = req.socket.remoteAddress;
    console.log(`+ Client ${clientCount}: ${ip} connecté`);
    clients.add(ws);

    /* ws.send(JSON.stringify({ message: "connected" })); */

    ws.on("close", () => {
        console.log(`- Client ${clientCount}: ${ip} déconnecté`);
        clients.delete(ws);
    });

    ws.on("error", (error) => {
        console.error(`# Client ${clientCount} erreur :`, error);
    });
});

// Fonction pour diffuser l'UID aux clients WebSocket
const sendUid = (uid) => {
    if (uid) {
        console.log(`Received NFC UID: ${uid}`);
        const payload = JSON.stringify({ uid: uid });
        for (const client of clients) {
            if (client.readyState === client.OPEN) {
                client.send(payload);
            }
        }
    }
};

// --- Terminal CLI (Readline) ---

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on("line", (line) => {
    const uid = line.trim();
    if (!uid) return;

    console.log(`Broadcasting NFC UID via CLI: ${uid}`);
    sendUid(uid);
});

// Commande ACM / Sérial
function sendToACM(dataCommand) {
    console.log(`[ACM / Serial] Writing command data: ${dataCommand}`);
}

// Handler générique pour les endpoints API
const handleApiRequest = (commandCode) => async (req, res) => {
    try {
        const reqData = req.body;
        console.log(`POST request received on ${req.path} with body:`, reqData);

        // Exécution de l'action ACM
        sendToACM(commandCode);

        res.status(200).json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// --- Routes Express ---

app.post("/porte", handleApiRequest("1"));
app.post("/caisse", handleApiRequest("2"));
app.post("/ventilo", handleApiRequest("3"));

// Route / (Interface HTML & envoi de formulaire)
app.get("/", (req, res) => {
    // Si un UID est passé en query param via le lien 'btn' (?btn=1&uid=1234)
    if (req.query.btn && req.query.uid) {
        const uid = req.query.uid;
        sendUid(uid);
        return res.redirect(`/?sent=${uid}`);
    }

    const sentUid = req.query.sent || "/";

    res.send(`
        <html>
            <body>
                <h1>Send NFC UID</h1>
                <form method="POST" action="/">
                    <input type="text" name="uid" placeholder="Enter NFC UID" required />
                    <button type="submit">Send</button>
                    <p>UID sent : ${sentUid}</p>
                    <p>${new Date().toISOString()}</p>
                    <a href="/?btn=1&uid=1234">1234</a>
                </form>
            </body>
        </html>
    `);
});

app.post("/", (req, res) => {
    const uid = req.body.uid;
    sendUid(uid);
    res.redirect(`/?sent=${uid}`);
});

// --- Lancement du serveur unique ---

server.listen(PORT, () => {
    console.log(`Server HTTP is running on http://localhost:${PORT}`);
    console.log(`WebSocket server is running on ws://localhost:${PORT}/ws`);
    console.log("Type a fake NFC UID in the CLI and press Enter to broadcast it.");
});