import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const SERVICE_FETCH_TIMEOUT_MS = 5000;

const buildServiceCandidates = (serviceName, localPort, envUrl) => {
  const candidates = [
    envUrl,
    `http://${serviceName}:${localPort}`,
    `http://${serviceName}`,
    `https://${serviceName}`,
    `http://localhost:${localPort}`,
  ].filter(Boolean);

  return [...new Set(candidates.map((url) => url.trim()))];
};

const PRODUCT_SERVICE_CANDIDATES = buildServiceCandidates(
  "product-service",
  5001,
  process.env.PRODUCT_SERVICE_URL,
);

const ORDER_SERVICE_CANDIDATES = buildServiceCandidates(
  "order-service",
  5002,
  process.env.ORDER_SERVICE_URL,
);

const fetchFromCandidates = async (candidates, path) => {
  const attempts = [];

  for (const baseUrl of candidates) {
    const targetUrl = `${baseUrl}${path}`;

    try {
      const response = await fetch(targetUrl, {
        signal: AbortSignal.timeout(SERVICE_FETCH_TIMEOUT_MS),
      });

      if (!response.ok) {
        attempts.push(`${targetUrl} -> ${response.status}`);
        continue;
      }

      return { baseUrl, targetUrl, response };
    } catch (error) {
      attempts.push(`${targetUrl} -> ${error.message}`);
    }
  }

  throw new Error(attempts.join(" | "));
};

app.get("/", (req, res) => {
  res.json({ message: "API Gateway is running" });
});

app.get("/health", (req, res) => {
  res.json({
    service: "gateway",
    status: "running",
    port: PORT,
  });
});

app.get("/api/status", async (req, res) => {
  const checkService = async (name, candidates, port) => {
    try {
      const { baseUrl, response } = await fetchFromCandidates(candidates, "/health");
      const data = await response.json();

      return {
        name,
        service: data.service || name,
        status: data.status || "running",
        port: data.port || port,
        url: baseUrl,
      };
    } catch (error) {
      return {
        name,
        service: name,
        status: "down",
        port,
        error: error.message,
      };
    }
  };

  try {
    const results = await Promise.all([
      Promise.resolve({
        name: "gateway",
        service: "gateway",
        status: "running",
        port: PORT,
      }),
      checkService("product-service", PRODUCT_SERVICE_CANDIDATES, 5001),
      checkService("order-service", ORDER_SERVICE_CANDIDATES, 5002),
    ]);

    res.json(results);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get service status",
      error: error.message,
    });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    console.log("Forwarding request to product-service...");
    const { baseUrl, response } = await fetchFromCandidates(
      PRODUCT_SERVICE_CANDIDATES,
      "/products",
    );
    const data = await response.json();
    console.log("Products resolved from:", baseUrl);
    res.json(data);
  } catch (error) {
    console.error("Product service error:", error.message);
    res.status(500).json({
      message: "Gateway could not reach product-service",
      error: error.message,
    });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    console.log("Forwarding request to order-service...");
    const { baseUrl, response } = await fetchFromCandidates(
      ORDER_SERVICE_CANDIDATES,
      "/orders",
    );
    const data = await response.json();
    console.log("Orders resolved from:", baseUrl);
    res.json(data);
  } catch (error) {
    console.error("Order service error:", error.message);
    res.status(500).json({
      message: "Gateway could not reach order-service",
      error: error.message,
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Gateway running on http://localhost:${PORT}`);
  console.log("Product service candidates:", PRODUCT_SERVICE_CANDIDATES);
  console.log("Order service candidates:", ORDER_SERVICE_CANDIDATES);
});
