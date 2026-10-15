import { products } from "./catalog.js";

const productGrid = document.querySelector("#product-grid");
const emptyState = document.querySelector("#empty-state");
const resultsNote = document.querySelector("#results-note");
const discoveryForm = document.querySelector("#discovery-form");
const discoveryInput = document.querySelector("#discovery-input");
const categoryButtons = [...document.querySelectorAll(".category-chip")];
const sortSelect = document.querySelector("#sort-select");
const cartDrawer = document.querySelector("#cart-drawer");
const drawerBackdrop = document.querySelector("#drawer-backdrop");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const drawerFooter = document.querySelector("#drawer-footer");
const toast = document.querySelector("#toast");

let activeCategory = "All";
let activeQuery = "";
let activeEdit = null;
let cart = loadCart();
let favorites = loadFavorites();
let toastTimer;

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem("morrow-cart") || "{}");
    return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
  } catch (error) {
    console.warn("Could not restore the saved bag.", error);
    return {};
  }
}

function loadFavorites() {
  try {
    const stored = JSON.parse(localStorage.getItem("morrow-favorites") || "[]");
    return Array.isArray(stored) ? new Set(stored.filter((id) => products.some((product) => product.id === id))) : new Set();
  } catch (error) {
    console.warn("Could not restore saved favorites.", error);
    return new Set();
  }
}

function saveState() {
  try {
    localStorage.setItem("morrow-cart", JSON.stringify(cart));
    localStorage.setItem("morrow-favorites", JSON.stringify([...favorites]));
  } catch (error) {
    console.warn("Could not save your bag or favorites.", error);
    showToast("Changes will be available for this visit only.");
  }
}

function formatPrice(amount) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function matchingProducts() {
  const recommendedOrder = activeEdit ? new Map(activeEdit.productIds.map((id, index) => [id, index])) : null;
  const matches = products.filter((product) =>
    (!activeEdit || recommendedOrder.has(product.id)) &&
    (activeCategory === "All" || product.category === activeCategory)
  );
  const sort = sortSelect.value;
  if (sort === "price-low") matches.sort((a, b) => a.price - b.price);
  if (sort === "price-high") matches.sort((a, b) => b.price - a.price);
  if (sort === "name") matches.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "featured" && recommendedOrder) {
    matches.sort((a, b) => recommendedOrder.get(a.id) - recommendedOrder.get(b.id));
  }
  return matches;
}

function renderProducts() {
  const visibleProducts = matchingProducts();
  productGrid.innerHTML = visibleProducts.map((product) => {
    const isFavorite = favorites.has(product.id);
    return `
      <article class="product-card">
        <div class="product-image-wrap">
          <img class="product-image" src="${product.image}" alt="${escapeHTML(product.imageAlt)}" loading="lazy" />
          <span class="product-badge">${escapeHTML(product.badge)}</span>
          <button class="favorite-button" type="button" data-favorite="${product.id}" aria-label="${isFavorite ? "Remove" : "Add"} ${escapeHTML(product.name)} ${isFavorite ? "from" : "to"} favorites" aria-pressed="${isFavorite}">${isFavorite ? "♥" : "♡"}</button>
          <button class="quick-add" type="button" data-add="${product.id}" aria-label="Add ${escapeHTML(product.name)} to bag"><span>Add to bag</span><span aria-hidden="true">+</span></button>
        </div>
        <div class="product-info">
          <span class="product-category">${escapeHTML(product.category)}</span>
          <div class="product-title-row"><h3 class="product-title">${escapeHTML(product.name)}</h3><span class="product-price">${formatPrice(product.price)}</span></div>
          <p class="product-description">${escapeHTML(product.description)}</p>
        </div>
      </article>`;
  }).join("");
  emptyState.hidden = visibleProducts.length !== 0;
  productGrid.hidden = visibleProducts.length === 0;
  const count = visibleProducts.length;
  resultsNote.classList.remove("error");
  resultsNote.textContent = activeEdit
    ? `Your AI edit for “${activeQuery}”: ${activeEdit.summary}`
    : `${count} thoughtfully chosen ${count === 1 ? "find" : "finds"}`;
}

function setCategory(category) {
  activeCategory = category;
  categoryButtons.forEach((button) => {
    const selected = button.dataset.category === category;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  document.querySelectorAll("[data-category-link]").forEach((link) => {
    link.classList.toggle("active", link.dataset.categoryLink === category);
  });
  document.querySelector(".nav-link:not([data-category-link])").classList.toggle("active", category === "All");
  renderProducts();
}

async function requestEdit(query) {
  const prompt = query.trim();
  if (!prompt || discoveryForm.getAttribute("aria-busy") === "true") return;

  const submitButton = discoveryForm.querySelector('button[type="submit"]');
  const promptButtons = [...document.querySelectorAll("[data-prompt]")];
  const originalButtonText = submitButton.innerHTML;
  discoveryForm.setAttribute("aria-busy", "true");
  discoveryInput.disabled = true;
  submitButton.disabled = true;
  submitButton.textContent = "Finding...";
  promptButtons.forEach((button) => { button.disabled = true; });
  resultsNote.classList.remove("error");
  resultsNote.textContent = "Your AI shopping companion is finding the right things...";

  try {
    const response = await fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "The AI service could not create recommendations.");

    const productIds = [...new Set(result.productIds)].filter((id) => products.some((product) => product.id === id));
    if (productIds.length === 0 || typeof result.summary !== "string") {
      throw new Error("The AI service returned an invalid product edit. Please try again.");
    }
    activeQuery = prompt;
    activeEdit = { productIds, summary: result.summary };
    renderProducts();
    document.querySelector("#products").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    console.error("Could not create an AI product edit.", error);
    resultsNote.classList.add("error");
    resultsNote.textContent = `Could not create your AI edit: ${error.message}`;
  } finally {
    discoveryForm.removeAttribute("aria-busy");
    discoveryInput.disabled = false;
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;
    promptButtons.forEach((button) => { button.disabled = false; });
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function cartQuantity() {
  return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
}

function renderCart() {
  const entries = Object.entries(cart).filter(([id, quantity]) =>
    products.some((product) => product.id === id) && Number.isInteger(quantity) && quantity > 0
  );
  cart = Object.fromEntries(entries);
  const count = cartQuantity();
  document.querySelector("#cart-count").textContent = count;
  document.querySelector("#drawer-count").textContent = `(${count})`;
  cartEmpty.hidden = entries.length > 0;
  cartItems.hidden = entries.length === 0;
  drawerFooter.hidden = entries.length === 0;
  cartItems.innerHTML = entries.map(([id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return `
      <article class="cart-item">
        <img src="${product.image}" alt="" />
        <div class="cart-item-info">
          <strong>${escapeHTML(product.name)}</strong>
          <span>${formatPrice(product.price)}</span>
          <div class="quantity-control" aria-label="Quantity for ${escapeHTML(product.name)}">
            <button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Remove one ${escapeHTML(product.name)}">−</button>
            <span>${quantity}</span>
            <button type="button" data-quantity="${product.id}" data-change="1" aria-label="Add one ${escapeHTML(product.name)}">+</button>
          </div>
        </div>
        <div><div class="cart-line-total">${formatPrice(product.price * quantity)}</div><button class="remove-item" type="button" data-remove="${product.id}">Remove</button></div>
      </article>`;
  }).join("");
  const subtotal = entries.reduce((sum, [id, quantity]) =>
    sum + products.find((product) => product.id === id).price * quantity, 0
  );
  document.querySelector("#cart-subtotal").textContent = formatPrice(subtotal);
  document.querySelector("#checkout-total").textContent = formatPrice(subtotal);
  saveState();
}

function openCart() {
  drawerBackdrop.hidden = false;
  requestAnimationFrame(() => {
    drawerBackdrop.classList.add("visible");
    cartDrawer.classList.add("open");
  });
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("dialog-open");
  cartDrawer.querySelector(".close-drawer").focus();
}

function closeCart() {
  drawerBackdrop.classList.remove("visible");
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("dialog-open");
  setTimeout(() => { drawerBackdrop.hidden = true; }, 260);
  document.querySelector("#open-cart").focus();
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  const product = products.find((item) => item.id === id);
  showToast(`${product.name} added to your bag.`);
}

function toggleFavorite(id) {
  if (favorites.has(id)) {
    favorites.delete(id);
    showToast("Removed from your favorites.");
  } else {
    favorites.add(id);
    showToast("Saved to your favorites.");
  }
  saveState();
  renderProducts();
}

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const favoriteButton = event.target.closest("[data-favorite]");
  if (addButton) addToCart(addButton.dataset.add);
  if (favoriteButton) toggleFavorite(favoriteButton.dataset.favorite);
});

document.querySelector(".category-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (button) setCategory(button.dataset.category);
});

document.querySelectorAll("[data-category-link]").forEach((link) => {
  link.addEventListener("click", () => setCategory(link.dataset.categoryLink));
});

document.querySelector(".nav-link:not([data-category-link])").addEventListener("click", () => setCategory("All"));

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    discoveryInput.value = button.dataset.prompt;
    requestEdit(button.dataset.prompt);
  });
});

discoveryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  requestEdit(discoveryInput.value);
});

document.querySelector(".search-toggle").addEventListener("click", () => {
  discoveryInput.focus();
  discoveryInput.scrollIntoView({ behavior: "smooth", block: "center" });
});

sortSelect.addEventListener("change", renderProducts);

document.querySelector("#reset-filters").addEventListener("click", () => {
  discoveryInput.value = "";
  activeQuery = "";
  activeEdit = null;
  setCategory("All");
});

document.querySelector("#open-cart").addEventListener("click", openCart);
document.querySelectorAll(".close-drawer").forEach((button) => button.addEventListener("click", closeCart));
drawerBackdrop.addEventListener("click", closeCart);

cartItems.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) {
    const id = quantityButton.dataset.quantity;
    cart[id] = (cart[id] || 0) + Number(quantityButton.dataset.change);
    if (cart[id] <= 0) delete cart[id];
    renderCart();
  }
  if (removeButton) {
    delete cart[removeButton.dataset.remove];
    renderCart();
    showToast("Item removed from your bag.");
  }
});

document.querySelector("#checkout-button").addEventListener("click", () => {
  closeCart();
  document.querySelector("#checkout-dialog").showModal();
  document.body.classList.add("dialog-open");
});

function closeCheckout() {
  document.querySelector("#checkout-dialog").close();
  document.body.classList.remove("dialog-open");
}

document.querySelector(".dialog-close").addEventListener("click", closeCheckout);
document.querySelector("#checkout-dialog").addEventListener("click", (event) => {
  if (event.target === event.currentTarget) closeCheckout();
});
document.querySelector("#checkout-dialog").addEventListener("close", () => document.body.classList.remove("dialog-open"));
document.querySelector("#finish-checkout").addEventListener("click", () => {
  cart = {};
  renderCart();
  closeCheckout();
  showToast("Demo order placed. Thanks for stopping by!");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("open")) closeCart();
});

categoryButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.category === "All")));
renderProducts();
renderCart();
