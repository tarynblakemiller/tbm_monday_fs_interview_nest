import { createServer, Server, IncomingMessage, ServerResponse } from 'http';

export class MockWebhookServer {
  private server: Server;
  private webhookCalls: any[] = [];
  private port: number;

  constructor(port: number = 0) {
    this.port = port;
    this.server = createServer(this.handleRequest.bind(this));
  }

  private handleRequest(req: IncomingMessage, res: ServerResponse) {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      this.webhookCalls.push({
        method: req.method,
        headers: req.headers,
        body: JSON.parse(body),
        timestamp: new Date(),
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'received' }));
    });
  }

  async start(): Promise<number> {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        const address = this.server.address();
        if (address === null) {
          this.port = 0;
        } else if (typeof address === 'string') {
          this.port = 0;
        } else {
          // Now TypeScript knows address is AddressInfo
          this.port = address.port;
        }
        resolve(this.port);
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  getWebhookCalls() {
    return [...this.webhookCalls];
  }

  clearWebhookCalls() {
    this.webhookCalls = [];
  }

  getPort() {
    return this.port;
  }
}
