const menuItems = [
  { id: "sunrise-latte", name: "Sunrise Latte", category: "coffee", description: "Espresso, oat milk, honey, and a little orange zest.", price: 5.5 },
  { id: "house-cold-brew", name: "House Cold Brew", category: "coffee", description: "Slow-steeped for 18 hours, smooth and chocolatey.", price: 4.75 },
  { id: "maple-cappuccino", name: "Maple Cappuccino", category: "coffee", description: "Velvety foam, double espresso, and maple warmth.", price: 5.25 },
  { id: "golden-chai", name: "Golden Chai", category: "tea", description: "House-spiced chai with turmeric and steamed milk.", price: 4.5 },
  { id: "berry-fizz", name: "Berry Fizz", category: "tea", description: "Hibiscus tea, seasonal berries, and sparkling water.", price: 4.25 },
  { id: "almond-croissant", name: "Almond Croissant", category: "food", description: "Buttery layers, almond cream, and toasted flakes.", price: 4.95 },
  { id: "cinnamon-toast", name: "Cinnamon Toast", category: "food", description: "Sourdough, whipped butter, cinnamon sugar, sea salt.", price: 4.25 },
  { id: "lemon-loaf", name: "Lemon Poppy Loaf", category: "food", description: "Bright lemon, poppy seeds, and a soft citrus glaze.", price: 4.5 }
];

const state = { cart: loadCart(), filter: "all" };
const menuGrid = document.querySelector("#menu-grid");
const cartDrawer = document.querySelector("#cart-drawer");
const cartContent = document.querySelector("#cart-content");
const cartTotal = document.querySelector("#cart-total");
const cartCount = document.querySelector("#cart-count");
const overlay = document.querySelector("#overlay");
const toast = document.querySelector("#toast");
let toastTimer;

function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem("brewBlissCart"));
    return savedCart && typeof savedCart === "object" ? savedCart : {};
  } catch (error) {
    return {};
  }
}

function saveCart() {
  localStorage.setItem("brewBlissCart", JSON.stringify(state.cart));
}

function money(value) {
  return `$${value.toFixed(2)}`;
}

function getMenuItem(itemId) {
  return menuItems.find((item) => item.id === itemId);
}

function categoryLabel(category) {
  return category === "coffee" ? "Coffee" : category === "tea" ? "Tea & more" : "Bites";
}

function productArt(category) {
  const artClass = category === "coffee" ? "" : category === "tea" ? "tea-art" : "food-art";
  return `<div class="product-art ${artClass}" aria-hidden="true"></div>`;
}

function renderMenu() {
  const visibleItems = state.filter === "all" ? menuItems : menuItems.filter((item) => item.category === state.filter);
  menuGrid.innerHTML = visibleItems.map((item) => `
    <article class="menu-card">
      <div class="menu-card-image ${item.category}">${productArt(item.category)}</div>
      <div class="menu-card-body">
        <p class="eyebrow">${categoryLabel(item.category)}</p>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="menu-card-meta">
          <strong>${money(item.price)}</strong>
          <button class="add-button" type="button" data-add-item="${item.id}" aria-label="Add ${item.name} to order">+</button>
        </div>
      </div>
    </article>
  `).join("");
}

function getCartEntries() {
  return Object.entries(state.cart).map(([itemId, quantity]) => ({ item: getMenuItem(itemId), quantity })).filter((entry) => entry.item);
}

function renderCart() {
  const entries = getCartEntries();
  const itemCount = entries.reduce((total, entry) => total + entry.quantity, 0);
  const subtotal = entries.reduce((total, entry) => total + entry.item.price * entry.quantity, 0);
  cartCount.textContent = itemCount;
  cartTotal.textContent = money(subtotal);

  if (!entries.length) {
    cartContent.innerHTML = `<div class="empty-cart"><div class="empty-cart-icon" aria-hidden="true">{ }</div><h3>Your order is empty</h3><p>Find something delicious on the menu<br>and make it a good day.</p></div>`;
    return;
  }

  cartContent.innerHTML = entries.map(({ item, quantity }) => `
    <div class="cart-item">
      <div class="cart-item-art">${productArt(item.category)}</div>
      <div class="cart-item-info"><strong>${item.name}</strong><small>${money(item.price)} each</small></div>
      <div class="cart-item-actions">
        <button class="quantity-button" type="button" data-decrease-item="${item.id}" aria-label="Decrease ${item.name} quantity">-</button>
        <span aria-label="Quantity">${quantity}</span>
        <button class="quantity-button" type="button" data-increase-item="${item.id}" aria-label="Increase ${item.name} quantity">+</button>
      </div>
      <strong class="cart-item-price">${money(item.price * quantity)}</strong>
    </div>
  `).join("");
}

function updateCart(itemId, change) {
  const nextQuantity = (state.cart[itemId] || 0) + change;
  if (nextQuantity <= 0) {
    delete state.cart[itemId];
  } else {
    state.cart[itemId] = nextQuantity;
  }
  saveCart();
  renderCart();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function setCartOpen(isOpen) {
  cartDrawer.classList.toggle("is-open", isOpen);
  cartDrawer.setAttribute("aria-hidden", String(!isOpen));
  overlay.hidden = !isOpen;
  document.body.classList.toggle("is-locked", isOpen);
  if (isOpen) document.querySelector(".close-drawer").focus();
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-item]");
  const increaseButton = event.target.closest("[data-increase-item]");
  const decreaseButton = event.target.closest("[data-decrease-item]");
  const openCart = event.target.closest("[data-open-cart]");
  const closeCart = event.target.closest("[data-close-cart]");

  if (addButton) {
    updateCart(addButton.dataset.addItem, 1);
    showToast(`${getMenuItem(addButton.dataset.addItem).name} added to your order`);
  }
  if (increaseButton) updateCart(increaseButton.dataset.increaseItem, 1);
  if (decreaseButton) updateCart(decreaseButton.dataset.decreaseItem, -1);
  if (openCart) setCartOpen(true);
  if (closeCart || event.target === overlay) setCartOpen(false);
});

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    document.querySelectorAll(".filter-button").forEach((filterButton) => filterButton.classList.toggle("is-active", filterButton === button));
    renderMenu();
  });
});

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
menuToggle.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});
siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    siteNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setCartOpen(false);
    siteNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

document.querySelector("#checkout-button").addEventListener("click", () => {
  if (!getCartEntries().length) {
    showToast("Add a favorite before placing your order.");
    return;
  }
  state.cart = {};
  saveCart();
  renderCart();
  setCartOpen(false);
  showToast("Order received! We will have it ready in about 15 minutes.");
});

document.querySelector("#contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.querySelector("#form-status");
  const fields = [...form.querySelectorAll("input, textarea")];
  let isValid = true;

  fields.forEach((field) => {
    const valid = field.checkValidity();
    field.classList.toggle("is-invalid", !valid);
    if (!valid) isValid = false;
  });

  if (!isValid) {
    status.className = "form-status error";
    status.textContent = "Please fill in each field so we know how to reach you.";
    fields.find((field) => !field.checkValidity()).focus();
    return;
  }

  status.className = "form-status success";
  status.textContent = "Thanks for reaching out. We will get back to you soon!";
  form.reset();
});

renderMenu();
renderCart();
