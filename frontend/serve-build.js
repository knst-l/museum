const fs = require("fs");
const http = require("http");
const path = require("path");

const root = path.join(__dirname, "build");
const port = Number(process.env.PORT || 3000);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(500);
      res.end("Server error");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(data);
  });
}

http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  const requestedPath = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(root, requestedPath);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (error, stat) => {
    if (!error && stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    fs.stat(filePath, (fileError, fileStat) => {
      if (!fileError && fileStat.isFile()) {
        sendFile(res, filePath);
        return;
      }

      sendFile(res, path.join(root, "index.html"));
    });
  });
}).listen(port, () => {
  console.log(`Frontend build server is running at http://localhost:${port}`);
});
