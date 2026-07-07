import { createServer } from "http";

import { createApp } from "./api/app.js";
import { initSocketServer } from "./realtime/socket.js";

const PORT = Number(process.env.PORT ?? 3001);

const app = createApp();
const httpServer = createServer(app);
initSocketServer(httpServer);

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Taskify API listening on http://localhost:${PORT}`);
});
