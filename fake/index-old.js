const { WebSocketServer } = require("ws");
const readline = require("readline");
const http = require("http");

// Configuration mimicking Go environment variables / defaults
const PORT = process.env.PORT || 4700;
const WS_PORT = process.env.WS_PORT || 3737;
const API_URL = process.env.BAR_API_URL || "http://localhost:8080";
const LOCAL_TOKEN = process.env.BAR_LOCAL_TOKEN || "";

// Create a WebSocket server on port 3737
const wss = new WebSocketServer({ port: WS_PORT });

console.log(`WebSocket server is running on ws://localhost:${WS_PORT}`);
console.log("Type a fake NFC UID in the CLI and press Enter to broadcast it.");

// Set up readline interface to read from standard input (CLI)
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Track connected clients
const clients = new Set();
let i = 0;
wss.on("connection", (ws) => {
    i++;
    console.log(`+ Client ${i}: ${ws._socket.remoteAddress} connected`);
    clients.add(ws);

    ws.send(JSON.stringify({ message: "connected" }));

    ws.on("close", () => {
        console.log(`- Client ${i}: ${ws._socket.remoteAddress} disconnected`);
        clients.delete(ws);
    });

    ws.on("error", (error) => {
        console.error(`# Client ${i} error :`, error);
    });
});

// Listen for lines entered in the terminal
rl.on("line", (line) => {
    const uid = line.trim();
    if (!uid) return;

    console.log(`Broadcasting NFC UID: ${uid}`);

    sendUid(uid);
});

// Helper function to simulate sendToACM by broadcasting or logging serial triggers
function sendToACM(dataCommand) {
    console.log(`[ACM / Serial] Writing command data: ${dataCommand}`);
    // If you want serial communication in Node, you could use packages like 'serialport'
}

// Logic translating the Go web server routes (/porte, /caisse, /ventilo)
async function handleApiRequest(req, res, commandCode) {
    if (req.method !== "POST") {
        res.writeHead(405, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
    }

    let body = "";
    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        try {
            const reqData = JSON.parse(body);
            console.log(`POST request received with body:`, reqData);

            // Forward request to external API_URL/auth/card similar to Go checkRequest logic
            // For a complete translation, you would use fetch() here to validate card_id and card_pin

            // Simulating successful validation check and triggering ACM action:
            sendToACM(commandCode);

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true }));
        } catch (err) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message }));
        }
    });
}

const sendUid = (uid) => {
    if (uid) {
        console.log(`Received NFC UID from form: ${uid}`);
        // Broadcast the UID to all connected WebSocket clients
        const payload = JSON.stringify({ uid: uid });
        for (const client of clients) {
            if (client.readyState === client.OPEN) {
                client.send(payload);
            }
        }
    }
};

// Create HTTP Server mimicking the Go Echo server routes[cite: 2, 3]
const httpServer = http.createServer((req, res) => {
    // CORS headers matching Go implementation
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

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/porte") return handleApiRequest(req, res, "1");
    if (url.pathname === "/caisse") return handleApiRequest(req, res, "2");
    if (url.pathname === "/ventilo") return handleApiRequest(req, res, "3");

    // if / return a html form to send an id :

    if (url.pathname === "/") {
        if (req.method === "POST") {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk.toString();
            });
            req.on("end", () => {
                const params = new URLSearchParams(body);
                const uid = params.get("uid");
                sendUid(uid);
                res.writeHead(302, { Location: `/?sent=${uid}` });
                res.end();
            });
            return;
        } else if (url.searchParams.has("btn")) {
            const uid = url.searchParams.get("uid")
            sendUid(uid);
            res.writeHead(302, { Location: `/?sent=${uid}` });
            res.end();
            return;
        }

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
            <html>
                <body>
                    <h1>Send NFC UID</h1>
                    <form method="POST" action="/">
                        <input type="text" name="uid" placeholder="Enter NFC UID" required />
                        <button type="submit">Send</button>
                        <p>UID sent : ${url.searchParams.get("sent") || "/"}</p>
                        <p>${new Date().toISOString()}</p>
                        <a href="/?btn=1&uid=1234">1234</a>
                    </form>
                </body>
            </html>
        `);
        return;
    }
    console.log(`Unhandled request: ${req.method} ${req.url}`);
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
});

httpServer.listen(PORT, () => {
    console.log(`HTTP server is running on http://localhost:${PORT}`);
});
