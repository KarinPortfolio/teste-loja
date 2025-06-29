const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 3000;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .connect()
  .then((client) => {
    console.log("Conectado ao PostgreSQL (Neon)!");
    client.release();
  })
  .catch((err) => console.error("Erro de conexão ao PostgreSQL:", err.stack));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:5500",
      "https://teste-loja-beta.vercel.app/",
      "https://teste-loja-dl7l.onrender.com",
      "null",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.post("/api/checkout", async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      customerName,
      customerEmail,
      customerAddress,
      totalAmount,
      orderItems,
    } = req.body;

    const orderId = `PED-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await client.query("BEGIN");

    const insertOrderQuery = `
            INSERT INTO orders (order_id, customer_name, customer_email, customer_address, total_amount)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING order_id;
        `;
    const orderValues = [
      orderId,
      customerName,
      customerEmail,
      customerAddress,
      totalAmount,
    ];
    await client.query(insertOrderQuery, orderValues);

    for (const item of orderItems) {
      const insertItemQuery = `
                INSERT INTO order_items (order_id, product_id, product_name, quantity, price_per_unit, line_total)
                VALUES ($1, $2, $3, $4, $5, $6);
            `;
      const itemValues = [
        orderId,
        item.id,
        item.name,
        item.quantity,
        item.price,
        item.price * item.quantity,
      ];
      await client.query(insertItemQuery, itemValues);
    }

    await client.query("COMMIT");

    res
      .status(200)
      .json({ message: "Pedido salvo com sucesso!", orderId: orderId });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao processar o checkout:", error);
    res
      .status(500)
      .json({ message: "Erro ao finalizar o pedido", error: error.message });
  } finally {
    client.release();
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
