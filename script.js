document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Definição dos dados mockados ---
  const mockProducts = [
    {
      id: "prod001",
      name: "Café de Cima",
      category: "Café Tradicional",
      price: 57.99,
      description: "Lorem ipsum dolor sit amet...",
      imageUrl: "imagens/1.jpg",
    },
    {
      id: "prod002",
      name: "América",
      category: "Café Gourmet",
      price: 79.9,
      description: "Lorem ipsum dolor sit amet...",
      imageUrl: "imagens/2.jpg",
    },
    {
      id: "prod003",
      name: "Mogiana",
      category: "Café Superior",
      price: 55.0,
      description: "Lorem ipsum dolor sit amet.",
      imageUrl: "imagens/3.jpg",
    },
    {
      id: "prod004",
      name: "Cafe Monica",
      category: "Café Tradicional",
      price: 68.0,
      description: "Lorem ipsum dolor sit amet.",
      imageUrl: "imagens/4.jpg",
    },
    {
      id: "prod005",
      name: "Don Superior",
      category: "Café Superior",
      price: 102.5,
      description: "Lorem ipsum dolor sit amet.",
      imageUrl: "imagens/5.jpg",
    },
    {
      id: "prod006",
      name: "Baggio",
      category: "Café Gourmet",
      price: 47.99,
      description: "Lorem ipsum dolor sit amet.",
      imageUrl: "imagens/6.jpg",
    },
  ];

  let cart = []; // Variável para armazenar os itens do carrinho

  // --- 2. Referências aos elementos do DOM ---
  const productListContainer = document.getElementById("product-list");
  const cartMessage = document.getElementById("cart-message");
  const cartItemCount = document.getElementById("cart-item-count");
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotalElement = document.getElementById("cart-total");
  const emptyCartMessage = cartItemsContainer.querySelector(
    ".empty-cart-message"
  );
  const proceedToCheckoutBtn = document.getElementById(
    "proceed-to-checkout-btn"
  );
  const checkoutSection = document.getElementById("checkout-section");
  const checkoutForm = document.getElementById("checkout-form");
  const orderItemsList = document.getElementById("order-items");
  const orderSummaryTotal = document.getElementById("order-summary-total");

  // --- 3. Funções Auxiliares e de Lógica de Negócio ---

  const formatPrice = (price) => `R$ ${price.toFixed(2).replace(".", ",")}`;

  function showCartMessage(productName) {
    cartMessage.innerHTML = `<img src="imagens/cart-icon.png" alt="Carrinho" class="cart-animation-icon"> "${productName}" adicionado!`;
    cartMessage.classList.add("show");

    const cartIcon = cartMessage.querySelector(".cart-animation-icon");
    if (cartIcon) {
      cartIcon.classList.add("animate");
    }

    setTimeout(() => {
      cartMessage.classList.remove("show");
      if (cartIcon) {
        cartIcon.classList.remove("animate");
      }
    }, 3000);
  }

  function createProductCard(product) {
    const productCard = document.createElement("div");
    productCard.classList.add("product-card");
    productCard.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}">
            <div>
              <h3>${product.name}</h3>
              <p class="price">${formatPrice(product.price)}</p>
              <p class="category">Categoria: ${product.category}</p>
              <button class="add-to-cart-btn button" data-product-id="${
                product.id
              }">
                  Adicionar ao Carrinho
              </button>
            </div>
        `;

    const addButton = productCard.querySelector(".add-to-cart-btn");
    addButton.addEventListener("click", () => {
      addToCart(product);
    });

    return productCard;
  }

  function addToCart(product) {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    renderCart();
    showCartMessage(product.name);
  }

  function renderCart() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
      emptyCartMessage.style.display = "block";
      proceedToCheckoutBtn.disabled = true;
    } else {
      emptyCartMessage.style.display = "none";
      proceedToCheckoutBtn.disabled = false;

      cart.forEach((item) => {
        const cartItemDiv = document.createElement("div");
        cartItemDiv.classList.add("cart-item");
        cartItemDiv.innerHTML = `
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p>Quantidade: ${item.quantity}</p>
                        </div>
                        <span class="cart-item-price">${formatPrice(
                          item.price * item.quantity
                        )}</span>
                `;
        cartItemsContainer.appendChild(cartItemDiv);
        total += item.price * item.quantity;
      });
    }

    cartItemCount.textContent = cart.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    cartTotalElement.textContent = formatPrice(total);
  }

  function updateOrderSummary() {
    orderItemsList.innerHTML = "";
    let total = 0;

    cart.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
                                <span class="item-name">${item.name} (x${
        item.quantity
      })</span>
                                <span class="item-price">${formatPrice(
                                  item.price * item.quantity
                                )}</span>
                        `;
      orderItemsList.appendChild(listItem);
      total += item.price * item.quantity;
    });

    orderSummaryTotal.textContent = formatPrice(total);
  }

  function initProductsDisplay() {
    mockProducts.forEach((product) => {
      const card = createProductCard(product);
      productListContainer.appendChild(card);
    });
    console.log("Produtos exibidos a partir do mockProducts.");
  }

  // --- 4. Chamadas de inicialização e Listeners de Evento ---

  // Inicializa a exibição dos produtos (AGORA DEPOIS DA DEFINIÇÃO DA FUNÇÃO)
  initProductsDisplay();

  // Inicializa a renderização do carrinho (mesmo que vazio)
  renderCart();

  // Listener para o botão "Prosseguir para o Checkout"
  proceedToCheckoutBtn.addEventListener("click", () => {
    checkoutSection.style.display = "block";
    window.scrollTo({
      top: checkoutSection.offsetTop - 80,
      behavior: "smooth",
    });
    updateOrderSummary();
  });

  // Listener para o formulário de checkout
  checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const customerName = document.getElementById("name").value;
    const customerEmail = document.getElementById("email").value;
    const customerAddress = `${document.getElementById("address").value}, ${
      document.getElementById("city").value
    } - CEP: ${document.getElementById("zipcode").value}`;

    const orderItems = cart.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    const totalAmount = cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    try {
      const backendBaseUrl = "https://teste-loja-dl7l.onrender.com";
      const checkoutEndpoint = "/api/checkout";

      const response = await fetch(`${backendBaseUrl}${checkoutEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerAddress,
          totalAmount,
          orderItems,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Erro desconhecido no servidor." }));
        throw new Error(
          `Erro ao finalizar pedido: ${
            response.statusText
          }. Detalhes: ${JSON.stringify(errorData)}`
        );
      }

      const data = await response.json();
      const orderId = data.orderId;

      const encodedItems = encodeURIComponent(JSON.stringify(orderItems));

      const confirmationUrl = `confirmation.html?orderId=${orderId}&name=${encodeURIComponent(
        customerName
      )}&email=${encodeURIComponent(
        customerEmail
      )}&address=${encodeURIComponent(customerAddress)}&items=${encodedItems}`;

      cart = [];
      renderCart(); // Renderiza o carrinho vazio após a compra
      checkoutForm.reset();

      window.location.href = confirmationUrl;
    } catch (error) {
      console.error("Erro ao processar o checkout:", error);
      alert(
        "Ocorreu um erro ao finalizar seu pedido. Por favor, tente novamente."
      );
    }
  });
});
