const express = require("express");
const http = require("http");
const readline = require("readline");
const { WebSocketServer } = require("ws");

// Configuration : Port 5050 unique
const PORT = process.env.PORT || 5050;
const MAIN_API = process.env.MAIN_API || "http://localhost:8080/"; // URL de l'API principale

const app = express();
const server = http.createServer(app);

const config = {
    "Admin (NZG)": 1234,
    "Admin 2": 5678,
    "Membre (Vex)": 1111,
    "Membre 2": 2222,
    "Membre 3": 3333,
};

// --- Middlewares Express ---

// Middleware CORS
app.use((req, res, next) => {
    const origin = req.headers["origin"] || "*";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, X-Local-Token",
    );

    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

// Middleware pour parser les corps de requêtes JSON et formulaires URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Configuration WebSocket (sur /ws) ---

// noServer: true permet de gérer le Handshake manuellement
const wss = new WebSocketServer({ noServer: true });
const wssReturn = new WebSocketServer({ noServer: true });
const clients = new Set();
const clientsReturn = new Set();
let clientCount = 0;
let clientCountReturn = 0;

// Interception des requêtes de mise à niveau HTTP vers WebSocket sur /ws
server.on("upgrade", (request, socket, head) => {
    const { pathname } = new URL(request.url, `http://${request.headers.host}`);

    if (pathname === "/ws")
        wss.handleUpgrade(request, socket, head, (ws) =>
            wss.emit("connection", ws, request),
        );
    else if (pathname === "/return")
        wssReturn.handleUpgrade(request, socket, head, (ws) =>
            wssReturn.emit("connection", ws, request),
        );
    else socket.destroy();
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

    ws.on("error", (error) =>
        console.error(`# Client ${clientCount} erreur :`, error),
    );
});

wssReturn.on("connection", (ws, req) => {
    clientCountReturn++;
    const ip = req.socket.remoteAddress;
    console.log(`+ Client Return ${clientCountReturn}: ${ip} connecté`);
    clientsReturn.add(ws);

    ws.on("close", () => {
        console.log(`- Client Return ${clientCountReturn}: ${ip} déconnecté`);
        clientsReturn.delete(ws);
    });

    ws.on("error", (error) =>
        console.error(`# Client Return ${clientCountReturn} erreur :`, error),
    );
});

// Fonction pour diffuser l'UID aux clients WebSocket
const sendUid = (uid) => {
    if (!uid) return;
    console.log(`Received NFC UID: ${uid}`);
    const payload = JSON.stringify({ uid: uid, timestamp: Date.now() });
    for (const client of clients)
        if (client.readyState === client.OPEN) client.send(payload);

    for (const client of clientsReturn)
        if (client.readyState === client.OPEN) client.send(payload);
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
    for (const client of clientsReturn)
        if (client.readyState === client.OPEN) client.send({commmand: dataCommand});
}

// Handler générique pour les endpoints API
const handleApiRequest = (commandCode) => async (req, res) => {
    try {
        const reqData = req.body;
        console.log(`POST request received on ${req.path} with body:`, reqData);
        if (!reqData || typeof reqData !== "object")
            throw new Error("Invalid request body");

        // Check auth
        const cardPin =
            "card_pin" in reqData && typeof reqData.card_pin === "string"
                ? reqData.card_pin.trim()
                : null;
        const cardId =
            "card_id" in reqData && typeof reqData.card_id === "string"
                ? reqData.card_id.trim()
                : null;
        if (!cardPin || !cardId)
            return res
                .status(400)
                .json({ error: "Missing card_pin or card_id" });

        // TODO : Vérification de l'authentification via l'API principale (MAIN_API)

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

app.get("/favicon.ico", (req, res) => {
    res.sendFile(__dirname + "/favicon.ico");
});

// Route / (Interface HTML & envoi de formulaire)
app.get("/", (req, res) => {
    // Si un UID est passé en query param via le lien 'btn' (?btn=1&uid=1234)
    if (req.query.btn && req.query.uid) {
        const uid = req.query.uid;
        sendUid(uid);
        return res.redirect(`/?sent=${uid}`);
    }

    const sentUid = req.query.sent;

    res.send(`
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="icon" href="/favicon.ico" type="image/x-icon" />
                <meta charset="UTF-8" />
                <title>Send NFC UID</title>
                <style>
                    body {
                        background: #111;
                        color: white;
                        font-family: sans-serif;
                        text-align: center;
                        align-content: center;
                    }
                    a {
                        color: #ddd !important;
                    }
                </style>
            </head>
            <body>
                <h1>Send NFC UID</h1>
                <form method="POST" action="/">
                    <p>Envoyer un UID NFC : <input type="text" name="uid" placeholder="UID" required /><button type="submit">Send</button></p>
                    <p>UID envoyé : ${sentUid || "/"}  -  ${sentUid ? new Date().toISOString() : "/"}</p>
                    <p>
                        ${Object.entries(config)
                            .map(
                                ([name, uid]) =>
                                    `<a href="/?btn=1&uid=${uid}">${name} (${uid})</a>`,
                            )
                            .join(" - ")}
                    </p>
                </form>
                <script>
                    if (window.location.search.includes('sent=')) {
                        const url = new URL(window.location);
                        url.searchParams.delete('sent');
                        window.history.replaceState({}, document.title, url.toString());
                    }
                </script>
            </body>
        </html>
    `);
});

app.post("/", (req, res) => {
    const uid = req.body.uid;
    sendUid(uid);
    res.redirect(`/?sent=${uid}`);
});

setInterval(
    () => {
        // if clients opened for more than 30 min, close them
        const now = Date.now();
        for (const client of clients)
            if (client.readyState === client.OPEN) {
                const elapsed = now - (client._lastActivity || now);
                if (elapsed > 30 * 60 * 1000) {
                    console.log(`Closing idle client after 30 min`);
                    client.close();
                }
            }
    },
    5 * 60 * 1000,
); // Check every 5 minutes

// --- Lancement du serveur unique ---

server.listen(PORT, () => {
    console.log(`Server HTTP is running on http://localhost:${PORT}`);
    console.log(`WebSocket server is running on ws://localhost:${PORT}/ws`);
    console.log(
        "Type a fake NFC UID in the CLI and press Enter to broadcast it.",
    );
});
