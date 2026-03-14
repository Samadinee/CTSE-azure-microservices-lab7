import express from "express";
import cors from "cors";

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

const products = [
  { id: 1, name: "Laptop", price: 1200, category: "Electronics" },
  { id: 2, name: "Phone", price: 800, category: "Electronics" },
  { id: 3, name: "Headphones", price: 150, category: "Accessories" },
  { id: 4, name: "Keyboard", price: 100, category: "Accessories" },
];

app.get("/health", (req, res) => {
  res.json({
    service: "product-service",
    status: "running",
    port: PORT,
  });
});

app.get("/products", (req, res) => {
  res.json(products);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Product Service running on http://localhost:${PORT}`);
});
