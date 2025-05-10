import http from "http";
import { handleRequest } from "./routes";

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url || "", `http://${req.headers.host}`);

  try {
    await handleRequest(req, res, parsedUrl);
  } catch (error) {
    res.writeHead(500);
    res.end(
      JSON.stringify({
        error: "Internal server error",
      })
    );
  }
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
