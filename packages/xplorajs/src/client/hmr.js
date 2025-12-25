const ws = new WebSocket("ws://localhost:3001");

ws.onmessage = async (e) => {
  const data = JSON.parse(e.data);

  if (data.type === "css") {
    document.querySelectorAll('link[rel="stylesheet"]').forEach((l) => {
      l.href = "/assets/style.css?v=" + Date.now();
    });
  }

  if (data.type === "reload") {
    console.log("Reloading...");
    location.reload();
  }
};
