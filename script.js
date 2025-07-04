document.addEventListener("DOMContentLoaded", () => {
  // --- 1. dados mockados ---
  const mockProducts = [
    {
      id: "prod001",
      name: "Aroma Real",
      category: "Café Tradicional",
      price: 45.99,
      description: "Lorem ipsum dolor sit amet...",
      imageUrl: "imagens/1.jpg",
    },
    {
      id: "prod002",
      name: "Blend Supremo",
      category: "Café Gourmet",
      price: 90.9,
      description: "Lorem ipsum dolor sit amet...",
      imageUrl: "imagens/2.jpg",
    },
    {
      id: "prod003",
      name: "Kafeega",
      category: "Café Superior",
      price: 75.0,
      description: "Lorem ipsum dolor sit amet.",
      imageUrl: "imagens/3.jpg",
    },
    {
      id: "prod004",
      name: "Grão Divino",
      category: "Café Tradicional",
      price: 58.0,
      description: "Lorem ipsum dolor sit amet.",
      imageUrl: "imagens/4.jpg",
    },
    {
      id: "prod005",
      name: "Don Superior",
      category: "Café Superior",
      price: 82.5,
      description: "Lorem ipsum dolor sit amet.",
      imageUrl: "imagens/5.jpg",
    },
    {
      id: "prod006",
      name: "Dom Supremo",
      category: "Café Gourmet",
      price: 97.99,
      description: "Lorem ipsum dolor sit amet.",
      imageUrl: "imagens/6.jpg",
    },
    {
      id: "prod007",
      name: "Caffè",
      category: "Café Tradicional",
      price: 55.99,
      description: "Lorem ipsum dolor sit amet.",
      imageUrl: "imagens/7.jpg",
    },
    {
      id: "prod008",
      name: "Matiz",
      category: "Café Gourmet",
      price: 92.0,
      description: "Lorem ipsum dolor sit amet.",
      imageUrl: "imagens/8.jpg",
    },
    {
      id: "prod009",
      name: "Gud Coffee",
      category: "Café Superior",
      price: 87.99,
      description: "Lorem ipsum dolor sit amet.",
      imageUrl: "imagens/9.jpg",
    },
  ];

  let cart = []; // Armazena itens do carrinho

  // --- 2. DOM ---
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
  const categoryListUl = document.getElementById("category-list"); // Referência para a lista de categorias

  // Endereço
  const nameInput = document.getElementById("name"); // Nova referência
  const emailInput = document.getElementById("email"); // Nova referência
  const cepInput = document.getElementById("zipcode");
  const addressInput = document.getElementById("address");
  const neighborhoodInput = document.getElementById("neighborhood");
  const cityInput = document.getElementById("city");
  const stateInput = document.getElementById("state");
  const numberInput = document.getElementById("number");
  const complementInput = document.getElementById("complement");

  // frete
  const shippingCostElement = document.getElementById("shipping-cost"); // Onde o valor do frete será exibido
  const orderSummaryGrandTotal = document.getElementById(
    "order-summary-grand-total"
  ); // valor total + frete

  // Referências para mensagens de erro
  const nameError = document.getElementById("name-error");
  const emailError = document.getElementById("email-error");
  const zipcodeError = document.getElementById("zipcode-error");
  const numberError = document.getElementById("number-error");

  // --- 3. Lógica de Negócio ---

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

  // --- CEP na ViaCEP ---
  async function fetchAddressByCep(cep) {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      return null;
    }
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      );
      if (!response.ok) {
        throw new Error("Erro ao buscar CEP. Verifique o número digitado.");
      }
      const data = await response.json();
      if (data.erro) {
        return null;
      }
      return data;
    } catch (error) {
      console.error("Erro na requisição ViaCEP:", error);
      return null;
    }
  }

  // calculo do frete
  async function calculateShippingFromBackend(cep, cartTotal) {
    try {
      const backendBaseUrl = "https://teste-loja-dl7l.onrender.com";
      const response = await fetch(`${backendBaseUrl}/api/calculate-shipping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep, cartTotal }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Erro ao calcular frete." }));
        throw new Error(
          `Erro no servidor ao calcular frete: ${JSON.stringify(errorData)}`
        );
      }
      const data = await response.json();
      return data.shippingCost;
    } catch (error) {
      console.error("Erro ao calcular frete:", error);
      alert("Não foi possível calcular o frete. Por favor, tente novamente.");
      return 0;
    }
  }

  // incluir
  async function updateOrderSummary() {
    orderItemsList.innerHTML = "";
    let productsTotal = 0;
    let currentShippingCost = 0;

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
      productsTotal += item.price * item.quantity;
    });

    orderSummaryTotal.textContent = formatPrice(productsTotal); // Total dos produtos

    // Se o CEP já estiver preenchido E o cartTotal for maior que 0, tenta calcular o frete
    const cep = cepInput.value;
    if (cep && cep.replace(/\D/g, "").length === 8 && productsTotal > 0) {
      currentShippingCost = await calculateShippingFromBackend(
        cep,
        productsTotal
      );
      shippingCostElement.textContent = formatPrice(currentShippingCost);
    } else if (productsTotal === 0) {
      shippingCostElement.textContent = formatPrice(0); // Frete 0 se não houver produtos
    } else {
      shippingCostElement.textContent = "Aguardando CEP...";
    }

    const grandTotal = productsTotal + currentShippingCost;
    orderSummaryGrandTotal.textContent = formatPrice(grandTotal); // Total Final (produtos + frete)
  }

  // Gerar as categorias dinamicamente
  function generateCategoryLinks() {
    // Pega todas as categorias únicas do mockProducts
    const categories = [
      "Todos", // Adiciona a opção "Todos" manualmente primeiro
      ...new Set(mockProducts.map((product) => product.category)),
    ];

    // Limpa a lista existente (se tiver algo, para garantir)
    categoryListUl.innerHTML = "";

    categories.forEach((category) => {
      const listItem = document.createElement("li");
      listItem.textContent = category;
      // Armazena a categoria no data-attribute para fácil acesso ao filtrar
      listItem.dataset.category = category;

      // Adiciona um listener para filtrar produtos quando a categoria é clicada
      listItem.addEventListener("click", () => {
        // Remove a classe 'active' de todos os itens e adiciona ao clicado
        document.querySelectorAll("#category-list li").forEach((item) => {
          item.classList.remove("active");
        });
        listItem.classList.add("active"); // Você pode adicionar um CSS para 'active'
        filterProductsByCategory(category);
      });
      categoryListUl.appendChild(listItem);
    });

    // Opcional: Adicionar a classe 'active' ao "Todos" no carregamento inicial
    const allCategoryItem = categoryListUl.querySelector(
      '[data-category="Todos"]'
    );
    if (allCategoryItem) {
      allCategoryItem.classList.add("active");
    }
  }

  // --- NOVA FUNÇÃO: Filtrar produtos por categoria ---
  function filterProductsByCategory(selectedCategory) {
    // Limpa a lista de produtos atual
    productListContainer.innerHTML = "";

    let filteredProducts;
    if (selectedCategory === "Todos") {
      filteredProducts = mockProducts; // Mostra todos se "Todos" for selecionado
    } else {
      // Filtra os produtos pela categoria selecionada
      filteredProducts = mockProducts.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Exibe os produtos filtrados
    if (filteredProducts.length > 0) {
      filteredProducts.forEach((product) => {
        const card = createProductCard(product);
        productListContainer.appendChild(card);
      });
    } else {
      productListContainer.innerHTML =
        "<p>Nenhum produto encontrado nesta categoria.</p>";
    }
  }

  function initProductsDisplay() {
    // Agora, em vez de exibir todos os produtos diretamente,
    // vamos chamar o filtro inicial para "Todos"
    filterProductsByCategory("Todos");
    console.log("Produtos exibidos a partir do mockProducts.");
  }

  // --- FUNÇÃO DE VALIDAÇÃO DE FORMULÁRIO ---
  function validateForm() {
    let isValid = true; // Assume que o formulário é válido inicialmente

    // Função auxiliar para mostrar/ocultar erros
    function showError(element, errorSpan, message) {
      if (message) {
        errorSpan.textContent = message;
        errorSpan.style.display = "block";
        element.classList.add("invalid"); // Adiciona classe para borda vermelha
      } else {
        errorSpan.textContent = "";
        errorSpan.style.display = "none";
        element.classList.remove("invalid"); // Remove a classe
      }
    }

    // Validação do Nome Completo
    if (nameInput.value.trim() === "") {
      showError(nameInput, nameError, "Por favor, digite seu nome completo.");
      isValid = false;
    } else if (nameInput.value.trim().length < 3) {
      showError(
        nameInput,
        nameError,
        "O nome deve ter pelo menos 3 caracteres."
      );
      isValid = false;
    } else {
      showError(nameInput, nameError, "");
    }

    // Validação do E-mail
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput.value.trim() === "") {
      showError(emailInput, emailError, "Por favor, digite seu e-mail.");
      isValid = false;
    } else if (!emailPattern.test(emailInput.value.trim())) {
      showError(emailInput, emailError, "Por favor, digite um e-mail válido.");
      isValid = false;
    } else {
      showError(emailInput, emailError, "");
    }

    // Validação do CEP
    const cleanCep = cepInput.value.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      showError(
        cepInput,
        zipcodeError,
        "Por favor, digite um CEP válido (8 dígitos)."
      );
      isValid = false;
    } else if (
      addressInput.value.trim() === "" ||
      neighborhoodInput.value.trim() === ""
    ) {
      // Se o CEP está ok, mas o endereço não foi preenchido (ViaCEP falhou ou ainda não preencheu)
      showError(
        cepInput,
        zipcodeError,
        "CEP inválido ou endereço não preenchido automaticamente."
      );
      isValid = false;
    } else {
      showError(cepInput, zipcodeError, "");
    }

    // Validação do Número (do endereço)
    if (numberInput.value.trim() === "") {
      showError(
        numberInput,
        numberError,
        "Por favor, digite o número do endereço."
      );
      isValid = false;
    } else if (isNaN(numberInput.value.trim())) {
      // Verifica se é um número
      showError(
        numberInput,
        numberError,
        "O número deve conter apenas dígitos."
      );
      isValid = false;
    } else {
      showError(numberInput, numberError, "");
    }

    return isValid; // Retorna true se tudo estiver válido, false caso contrário
  }

  // --- 4. Chamadas de inicialização e Listeners de Evento ---

  // Chame a função para gerar os links de categoria APÓS os produtos estarem definidos
  generateCategoryLinks();

  // Inicializa a exibição dos produtos (agora filtrando por "Todos")
  initProductsDisplay();

  // Inicializa a renderização do carrinho (mesmo que vazio)
  renderCart();
  // Garante que o resumo do pedido é atualizado ao carregar a página (se já tiver itens no carrinho)
  updateOrderSummary(); // Chamada inicial para mostrar "Total Produtos" e "Aguardando CEP..."

  // Listener para o botão "Prosseguir para o Checkout"
  proceedToCheckoutBtn.addEventListener("click", () => {
    checkoutSection.style.display = "block";
    window.scrollTo({
      top: checkoutSection.offsetTop - 80,
      behavior: "smooth",
    });
    // Chame updateOrderSummary aqui para garantir que o frete seja calculado quando o checkout é aberto
    updateOrderSummary();
  });

  // Listener para o campo de CEP
  cepInput.addEventListener("blur", async () => {
    const cep = cepInput.value;
    const addressData = await fetchAddressByCep(cep);

    if (addressData) {
      addressInput.value = addressData.logradouro || "";
      neighborhoodInput.value = addressData.bairro || "";
      cityInput.value = addressData.localidade || "";
      stateInput.value = addressData.uf || "";
      // Após preencher o endereço, atualiza o resumo do pedido para recalcular o frete
      await updateOrderSummary(); // <<-- Chamar updateOrderSummary aqui
    } else {
      // Limpa os campos se o CEP for inválido ou não encontrado
      addressInput.value = "";
      neighborhoodInput.value = "";
      cityInput.value = "";
      stateInput.value = "";
      shippingCostElement.textContent = "Inválido"; // Limpa o frete se o CEP for inválido
      orderSummaryGrandTotal.textContent = formatPrice(
        cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
      ); // Reseta o total final
      alert("CEP não encontrado ou inválido. Por favor, verifique.");
    }
  });

  // Listener para o formulário de checkout
  checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Impede o envio padrão do formulário

    // Chamar a função de validação antes de prosseguir
    if (!validateForm()) {
      // Se a validação falhar, para a execução da função
      alert(
        "Por favor, preencha todos os campos obrigatórios e corrija os erros."
      );
      return;
    }

    // Se a validação passar, o código abaixo será executado normalmente
    const customerName = nameInput.value; // Usar a referência direta
    const customerEmail = emailInput.value; // Usar a referência direta

    const street = addressInput.value;
    const number = numberInput.value;
    const complement = complementInput.value;
    const neighborhood = neighborhoodInput.value;
    const city = cityInput.value;
    const state = stateInput.value;
    const zipcode = cepInput.value;

    let customerAddress = `${street}, ${number}`;
    if (complement && complement.trim() !== "") {
      customerAddress += ` - ${complement}`;
    }
    customerAddress += ` - ${neighborhood}, ${city} - ${state} - CEP: ${zipcode}`;

    const orderItems = cart.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    const productsTotal = cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const finalShippingCost =
      productsTotal > 0
        ? await calculateShippingFromBackend(zipcode, productsTotal)
        : 0;

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
          totalAmount: productsTotal,
          shippingCost: finalShippingCost,
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

      const grandTotal = productsTotal + finalShippingCost; // Recalcule ou use o valor já exibido no DOM se preferir

      const confirmationUrl = `confirmation.html?orderId=${orderId}&name=${encodeURIComponent(
        customerName
      )}&email=${encodeURIComponent(
        customerEmail
      )}&address=${encodeURIComponent(
        customerAddress
      )}&shippingCost=${finalShippingCost}&items=${encodedItems}&grandTotal=${grandTotal.toFixed(
        2
      )}`;

      cart = [];
      renderCart();
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
