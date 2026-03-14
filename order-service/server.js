import express from "express";
import cors from "cors";

const app = express();
const PORT = 5002;

app.use(cors());
app.use(express.json());

const orders = [
  {
    id: 1,
    customer: "Nimal",
    product: "Laptop",
    quantity: 1,
    status: "Completed",
  },
  {
    id: 2,
    customer: "Kamal",
    product: "Phone",
    quantity: 2,
    status: "Pending",
  },
  {
    id: 3,
    customer: "Saman",
    product: "Keyboard",
    quantity: 1,
    status: "Processing",
  },
];

app.get("/health", (req, res) => {
  res.json({
    service: "order-service",
    status: "running",
    port: PORT,
  });
});

app.get("/orders", (req, res) => {
  res.json(orders);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Order Service running on http://localhost:${PORT}`);
});
