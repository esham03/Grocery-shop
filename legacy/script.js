const products = [
  {
    name: "Fresh Apples",
    price: 3.99,
    image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Bananas",
    price: 1.49,
    image: "https://images.unsplash.com/photo-1574226516831-e1dff420e13c?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Carrots",
    price: 2.29,
    image: "https://images.unsplash.com/photo-1605456799124-6641a5fcf0f4?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Tomatoes",
    price: 2.99,
    image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=80"
  }
];

let cartCount = 0;

function updateCartCount() {
  document.getElementById("cart-count").textContent = cartCount;
}

function addToCart(productName) {
  cartCount++;
  updateCartCount();
  alert(`${productName} added to cart!`);
}

function renderProducts() {
  const container = document.getElementById("product-list");
  products.forEach(product => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>$${product.price.toFixed(2)}</p>
      <button onclick="addToCart('${product.name}')">Add to Cart</button>
    `;
    container.appendChild(div);
  });
}

renderProducts();
