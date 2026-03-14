import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || "http://localhost:5001";

const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || "http://localhost:5002";

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
  const checkService = async (name, url, port) => {
    try {
      const response = await fetch(`${url}/health`);
      const data = await response.json();

      return {
        name,
        service: data.service || name,
        status: data.status || "running",
        port: data.port || port,
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
      checkService("product-service", PRODUCT_SERVICE_URL, 5001),
      checkService("order-service", ORDER_SERVICE_URL, 5002),
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
    const response = await fetch(`${PRODUCT_SERVICE_URL}/products`);
    const data = await response.json();
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
    const response = await fetch(`${ORDER_SERVICE_URL}/orders`);
    const data = await response.json();
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
  console.log("Product service target:", PRODUCT_SERVICE_URL);
  console.log("Order service target:", ORDER_SERVICE_URL);
});
