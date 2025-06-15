document.addEventListener("DOMContentLoaded", () => {
  const mockProducts = [
    {
      id: "prod001",
      name: "Café do Centro",
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
      name: "Cafe Santa Monica",
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

  let cart = [];

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

  const formatPrice = (price) => `R$ ${price.toFixed(2).replace(".", ",")}`;

  function showCartMessage(productName) {
    cartMessage.textContent = `"${productName}" adicionado ao carrinho!`;
    cartMessage.classList.add("show");
    setTimeout(() => {
      cartMessage.classList.remove("show");
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
      <button class="add-to-cart-btn button" data-product-id="${product.id}">
        Adicionar ao Carrinho
      </button>
    </divss=>
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
        <span class="item-name">${item.name} (x${item.quantity})</span>
        <span class="item-price">${formatPrice(
          item.price * item.quantity
        )}</span>
      `;
      orderItemsList.appendChild(listItem);
      total += item.price * item.quantity;
    });

    orderSummaryTotal.textContent = formatPrice(total);
  }

  mockProducts.forEach((product) => {
    const card = createProductCard(product);
    productListContainer.appendChild(card);
  });

  proceedToCheckoutBtn.addEventListener("click", () => {
    checkoutSection.style.display = "block";
    window.scrollTo({
      top: checkoutSection.offsetTop - 80,
      behavior: "smooth",
    });
    updateOrderSummary();
  });

  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const customerName = document.getElementById("name").value;
    const customerEmail = document.getElementById("email").value;
    const customerAddress = `${document.getElementById("address").value}, ${
      document.getElementById("city").value
    } - CEP: ${document.getElementById("zipcode").value}`;
    const orderId = "PED-" + Math.floor(Math.random() * 100000);

    const orderItems = cart.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));
    const encodedItems = encodeURIComponent(JSON.stringify(orderItems));

    const confirmationUrl = `confirmation.html?orderId=${orderId}&name=${encodeURIComponent(
      customerName
    )}&email=${encodeURIComponent(customerEmail)}&address=${encodeURIComponent(
      customerAddress
    )}&items=${encodedItems}`;

    cart = [];
    renderCart();
    checkoutForm.reset();

    window.location.href = confirmationUrl;
  });

  renderCart();
});
