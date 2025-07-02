const express = require("express");
const { Pool } = require("pg"); // Corrigido: 'require = require("pg")' não é necessário
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000; // Use a porta do ambiente ou 3000

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false, // Necessário para Neon/Render em produção
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
      "null", // 'null' é para testar arquivos locais, remover em produção se não for mais necessário
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Função para simular o cálculo de frete baseado no estado
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
      cost = 22.0; // Região Sul
      break;
    case "BA":
    case "PE":
    case "CE":
      cost = 25.0; // Nordeste
      break;
    default:
      cost = 30.0; // Outros estados
      break;
  }
  // Exemplo: Frete grátis para compras acima de R$200 (você pode usar o cartTotal passado aqui)
  // if (cartTotal >= 200) {
  //   cost = 0;
  // }
  return cost;
}

// NOVO ENDPOINT PARA CALCULAR O FRETE
app.post("/api/calculate-shipping", (req, res) => {
  const { cep, cartTotal } = req.body; // 'cartTotal' pode ser usado para regras de frete grátis

  if (!cep) {
    return res
      .status(400)
      .json({ message: "CEP é obrigatório para calcular o frete." });
  }

  // Simulação de busca de estado com base nos primeiros dígitos do CEP
  // Em uma aplicação real, você faria uma chamada para a ViaCEP AQUI NO BACKEND
  // para obter o estado real com base no CEP.
  let state = "";
  const firstTwoDigits = cep.substring(0, 2);
  if (firstTwoDigits >= "01" && firstTwoDigits <= "09") state = "SP";
  else if (firstTwoDigits >= "20" && firstTwoDigits <= "26") state = "RJ";
  else if (firstTwoDigits >= "30" && firstTwoDigits <= "39") state = "MG";
  else if (firstTwoDigits >= "80" && firstTwoDigits <= "87") state = "PR";
  else state = "XX"; // Estado desconhecido para simulação

  const shippingCost = calculateShippingCost(state);

  res.status(200).json({ shippingCost: shippingCost });
});

// ENDPOINT DE CHECKOUT (VERSÃO ATUALIZADA COM FRETE)
app.post("/api/checkout", async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      customerName,
      customerEmail,
      customerAddress,
      totalAmount, // Este é o total dos produtos (sem frete)
      shippingCost, // NOVO: Custo do frete enviado do frontend
      orderItems,
    } = req.body;

    // O total_amount no DB deve ser o total dos produtos + frete
    const finalTotalAmount =
      parseFloat(totalAmount) + parseFloat(shippingCost || 0);

    const orderId = `PED-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await client.query("BEGIN");

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
      finalTotalAmount, // Total FINAL (produtos + frete)
      shippingCost || 0, // Custo do frete
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

// Listener para iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
