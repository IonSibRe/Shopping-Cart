// DOM Elements
const body = document.querySelector("body");

// Navbar
const header_overlay = document.querySelector(".header-overlay");
const overlay_cart = document.querySelector(".overlay-cart");
const cart_btn = document.querySelector("#cart-a");
const cart_exit_btn = document.querySelector(".cart-exit-btn");

// Products
const products_container = document.querySelector(".products-container");

// Cart
const cart_item_container = document.querySelector(".cart-item-container");
const items_in_cart_count = document.querySelector(".items-in-cart-count");
const cart_total = document.querySelector(".total-price");
const clear_cart_btn = document.querySelector(".clear-cart-btn");

// Globals
let cart = [];

// Open & Close Navbar
cart_btn.addEventListener("click", () => {
    header_overlay.style.visibility = "visible";
    overlay_cart.classList.add("show-cart");
    body.style.overflow = "hidden";
});

cart_exit_btn.addEventListener("click", () => {
    header_overlay.style.visibility = "hidden";
    overlay_cart.classList.remove("show-cart");
    body.style.overflowY = "visible";
    body.style.overflowX = "hidden";
});

// Get Products
const getProducts = async () => {
    try {
        const res = await fetch("products.json");
        const data = await res.json();
        return data;
    } catch (error) {
        console.log(error);
    }
};

class UI {
    renderProducts(products) {
        products.forEach((product) => {
            let output = `
            <div class="products-item-img-wrap">
                <img
                    src="${product.image}"
                    alt="${product.title}"
                    class="products-item-img"
                />
                <div class="products-item-img-inner-wrap">
                    <button class="products-item-add-to-cart-a" data-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
                <div class="products-item-text-wrap">
                    <h4 class="products-item-h4">${product.title}</h4>
                    <h4 class="products-item-price">${product.price}</h4>
                </div>
            </div>
            `;

            const productDOM = document.createElement("div");
            productDOM.classList.add("products-item");
            productDOM.innerHTML = output;
            products_container.appendChild(productDOM);
        });
    }

    getCartBtns() {
        const btns = [
            ...document.querySelectorAll(".products-item-add-to-cart-a"),
        ];

        btns.forEach((btn) => {
            let btn_id = btn.dataset.id;

            let alreadyInCart = cart.find((item) => item.id === btn_id);

            if (alreadyInCart) {
                btn.textContent = "In Cart";
                btn.disabled = true;
            }

            btn.addEventListener("click", () => {
                // Get the item from Local Storage
                const item = Storage.getProduct(btn_id);
                item.amount = 1;

                // Add the item to cart
                cart.push(item);

                // Update the btn
                btn.textContent = "In Cart";
                btn.disabled = true;

                // Add product to Cart DOM
                this.addProductToCartDOM(btn_id);

                // Update Cart values
                this.updateCartValues();

                // Save Cart to Local Storage
                Storage.saveCart(cart);
            });
        });
    }

    cartUpdates() {
        clear_cart_btn.addEventListener("click", () => {
            this.clearCart();
        });

        cart_item_container.addEventListener("click", (e) => {
            let id = e.target.id;

            // Remove Single item
            if (e.target.classList.contains("cart-item-remove")) {
                this.removeItem(e.target);
            }

            // Add amount
            else if (e.target.classList.contains("fa-chevron-up")) {
                let cart_item_id = e.target.dataset.id;

                // Update item amount in cart
                cart.forEach((item) => {
                    if (item.id === cart_item_id) {
                        item.amount++;

                        // Update DOM
                        e.target.parentElement.nextElementSibling.textContent =
                            item.amount;

                        // Update Cart Values
                        this.updateCartValues();

                        // Save Cart to Local Storage
                        Storage.saveCart(cart);
                    }
                });
            }

            // Subtract amount
            else if (e.target.classList.contains("fa-chevron-down")) {
                let cart_item_id = e.target.dataset.id;

                // Update item amount in cart
                cart.forEach((item) => {
                    if (item.id === cart_item_id && item.amount > 1) {
                        item.amount--;

                        // Update DOM
                        e.target.parentElement.previousElementSibling.textContent =
                            item.amount;

                        // Update Cart Values
                        this.updateCartValues();

                        // Save Cart to Local Storage
                        Storage.saveCart(cart);
                    }
                });
            }
        });
    }

    // Add item to DOM Cart
    addProductToCartDOM(id) {
        cart.forEach((product) => {
            if (product.id === id) {
                let cartOutput = `
                <!-- Cart Img Wrap -->
                <div class="cart-img-wrap">
                    <img
                        src="${product.image}"
                        alt=""
                        class="cart-img"
                    />
                </div>
                <!-- Cart Title & Price & Remove Button -->
                <div class="cart-text-wrap">
                    <h4 class="cart-item-title">
                        ${product.title}
                    </h4>
                    <h4 class="cart-item-price">${product.price}</h4>
                    <a href="#" class="cart-item-remove" id="${product.id}"
                        >remove</a
                    >
                </div>
                <!-- Cart Quantity Picker -->
                <div class="cart-items-quantity-picker">
                    <a href="#" class="cart-item-arrow-up-a" data-id="${product.id}">
                        <i class="fas fa-chevron-up" data-id="${product.id}"></i>
                    </a>
                    <span class="cart-items-count">${product.amount}</span>
                    <a href="#" class="cart-item-arrow-down-a">
                        <i class="fas fa-chevron-down" data-id="${product.id}"></i>
                    </a>
                </div>
                `;

                const cartOutputDOM = document.createElement("div");
                cartOutputDOM.classList.add("cart-item");
                cartOutputDOM.setAttribute("data-id", product.id);
                cartOutputDOM.innerHTML = cartOutput;

                cart_item_container.appendChild(cartOutputDOM);
            }
        });
    }

    // Update Cart Values
    updateCartValues() {
        let totalPrice = 0;
        let itemCount = 0;
        cart.forEach((item) => {
            totalPrice += item.price * item.amount;
            itemCount += item.amount;
        });

        cart_total.textContent = totalPrice.toFixed(2);
        items_in_cart_count.textContent = itemCount;
    }

    // Setup the Page
    setupPage() {
        cart = Storage.getCart();

        // Add items to cart
        cart.forEach((item) => {
            this.addProductToCartDOM(item.id);
        });

        // Update Cart Values
        this.updateCartValues();
    }

    // Clear Cart
    clearCart() {
        const btns = [
            ...document.querySelectorAll(".products-item-add-to-cart-a"),
        ];

        // Update add to cart btns
        btns.forEach((btn) => {
            btn.textContent = "Add to Cart";
            btn.disabled = false;
        });

        // Empty cart
        cart = [];

        // Save cart to Local Storage
        Storage.saveCart(cart);

        // Clear Cart Items from DOM
        cart_item_container.innerHTML = "";

        // Update Cart Values
        this.updateCartValues();
    }

    removeItem(cartItem) {
        const btns = [
            ...document.querySelectorAll(".products-item-add-to-cart-a"),
        ];

        btns.forEach((btn) => {
            if (btn.dataset.id === cartItem.id) {
                btn.textContent = "Add to Cart";
                btn.disabled = false;
            }
        });

        // Remove item from cart
        cart = cart.filter((item) => item.id !== cartItem.id);

        // Save cart to Local Storage
        Storage.saveCart(cart);

        // Clear Cart Item from DOM
        cart_item_container.removeChild(cartItem.parentElement.parentElement);

        // Update Cart Values
        this.updateCartValues();
    }
}

class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    static getProduct(id) {
        const products = JSON.parse(localStorage.getItem("products"));
        return products.find((item) => item.id === id);
    }

    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    static getCart() {
        return localStorage.getItem("cart")
            ? JSON.parse(localStorage.getItem("cart"))
            : [];
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();

    ui.setupPage();

    getProducts()
        .then((products) => {
            ui.renderProducts(products);
            Storage.saveProducts(products);
        })
        .then(() => {
            ui.getCartBtns();
            ui.cartUpdates();
        })
        .catch((err) => {
            // Set an error log for the user
            const errLog = document.querySelector(".error-log");
            errLog.style.display = "flex";
            console.log(err);
        });
});
