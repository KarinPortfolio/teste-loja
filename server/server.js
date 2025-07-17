const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
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
      "https://teste-loja-beta.vercel.app",
      "https://teste-loja-dl7l.onrender.com",
      ...(process.env.NODE_ENV !== "production" ? ["null"] : []), // 'null' apenas em desenvolvimento
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Simula cálculo de frete baseado no estado
function calculateShippingCost(state) {
  let cost = 0;
  switch (state.toUpperCase()) {
    case "SP":
      cost = 15.0;
      break;
    case "RJ":
      cost = 18.5;
      break;
    case "MG":
      cost = 17.0;
      break;
    case "PR":
    case "SC":
    case "RS":
      cost = 22.0;
      break;
    case "BA":
    case "PE":
    case "CE":
      cost = 25.0;
      break;
    default:
      cost = 30.0;
      break;
  }
  // Frete grátis para compras acima de R$200
  if (cartTotal >= 200) {
    cost = 0;
  }
  return cost;
}

// Calcular frete
app.post("/api/calculate-shipping", (req, res) => {
  const { cep, cartTotal } = req.body;

  if (!cep) {
    return res
      .status(400)
      .json({ message: "CEP é obrigatório para calcular o frete." });
  }

  // Simulação de busca de estado com base nos primeiros dígitos do CEP
  const cepStateMap = [
    {
      state: "SP",
      ranges: [
        [1000, 19999],
        [11000000, 19999999],
      ],
    },
    { state: "RJ", ranges: [[20000, 28999]] },
    { state: "ES", ranges: [[29000, 29999]] },
    { state: "MG", ranges: [[30000, 39999]] },
    { state: "BA", ranges: [[40000, 48999]] },
    { state: "SE", ranges: [[49000, 49999]] },
    { state: "PE", ranges: [[50000, 56999]] },
    { state: "AL", ranges: [[57000, 57999]] },
    { state: "PB", ranges: [[58000, 58999]] },
    { state: "RN", ranges: [[59000, 59999]] },
    { state: "CE", ranges: [[60000, 63999]] },
    { state: "PI", ranges: [[64000, 64999]] },
    { state: "PA", ranges: [[66000, 68899]] },
    { state: "AP", ranges: [[68900, 68999]] },
    {
      state: "AM",
      ranges: [
        [69000, 69299],
        [69400, 69899],
      ],
    },
    { state: "RR", ranges: [[69300, 69399]] },
    { state: "AC", ranges: [[69900, 69999]] },
    {
      state: "DF",
      ranges: [
        [70000, 73699],
        [73000, 73699],
      ],
    },
  ];

  let state = "XX"; // Estado desconhecido
  const cepNum = parseInt(cep.replace(/\D/g, "").substring(0, 5), 10);

  for (const entry of cepStateMap) {
    for (const [start, end] of entry.ranges) {
      if (cepNum >= start && cepNum <= end) {
        state = entry.state;
        break;
      }
    }
    if (state !== "XX") break;
  }

  const shippingCost = calculateShippingCost(state);

  res.json({
    state,
    shippingCost,
  });
});

// checkout
app.post("/api/checkout", async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      customerName,
      customerEmail,
      customerAddress,
      totalAmount, // total dos produtos (sem frete)
      shippingCost, // Custo do frete
      orderItems,
      orderId,
    } = req.body;

    // O total_amount no DB deve ser o total dos produtos + frete
    const parsedShippingCost = Number.isFinite(Number(shippingCost))
      ? Number(shippingCost)
      : 0;
    const finalTotalAmount = parseFloat(totalAmount) + parsedShippingCost;

    const insertOrderQuery = `
      INSERT INTO orders (order_id, customer_name, customer_email, customer_address, total_amount, shipping_cost)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING order_id;
    `;
    const orderValues = [
      orderId,
      customerName,
      customerEmail,
      customerAddress,
      finalTotalAmount,
      parsedShippingCost,
    ];
    await client.query("BEGIN");
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
        Number(item.quantity),
        Number(item.price),
        Number(item.price) * Number(item.quantity),
      ];
      await client.query(insertItemQuery, itemValues);
    }

    await client.query("COMMIT");

    res
      .status(200)
      .json({ message: "Pedido salvo com sucesso!", orderId: orderId });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Erro ao executar ROLLBACK:", rollbackError);
    }
    console.error("Erro ao processar o checkout:", error);
    res
      .status(500)
      .json({ message: "Erro ao finalizar o pedido", error: error.message });
  } finally {
    client.release();
  }
});
// iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
