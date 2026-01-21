const wsPort = window.__XPLORA_WS_PORT__ || 3001;
const ws = new WebSocket(`ws://localhost:${wsPort}`);

ws.onopen = () => {
	console.log("[HMR] Connected to dev server");
};

ws.onclose = () => {
	console.log("[HMR] Disconnected from dev server");
};

ws.onerror = (error) => {
	console.error("[HMR] WebSocket error:", error);
};

ws.onmessage = async (e) => {
	const data = JSON.parse(e.data);

	if (data.type === "css") {
		console.log("[HMR] CSS updated, reloading styles...");
		document.querySelectorAll('link[rel="stylesheet"]').forEach((l) => {
			l.href = l.href.split("?")[0] + "?v=" + Date.now();
		});
	}

	if (data.type === "reload") {
		console.log("[HMR] Files changed, reloading page...");
		location.reload();
	}
};
