
// User Authentication
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const authContainer = document.getElementById('auth-container');
const storeContainer = document.getElementById('store-container');

// Shopping Cart
const cartCount = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');
const totalAmount = document.getElementById('total-amount');
const checkoutBtn = document.getElementById('checkout-btn');
const closeModal = document.querySelector('.close');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const cartIcon = document.querySelector('.cart-icon');

let cart = [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = null;

// Toggle between login and register forms
showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
});

// Register new user
registerBtn.addEventListener('click', () => {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;

    if (!username || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    if (users.some(user => user.username === username)) {
        alert('Username already exists');
        return;
    }

    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! Please login.');
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
});

// Login user
loginBtn.addEventListener('click', () => {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }

    const user = users.find(user => user.username === username && user.password === password);

    if (!user) {
        alert('Invalid username or password');
        return;
    }

    currentUser = username;
    authContainer.style.display = 'none';
    storeContainer.style.display = 'block';
});

// Shopping Cart Functions
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id,
            name,
            price: parseFloat(price),
            quantity: 1
        });
    }

    updateCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

function updateQuantity(id, newQuantity) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity = newQuantity;
        updateCart();
    }
}

function updateCart() {
    // Save cart to localStorage
    if (currentUser) {
        const userCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
        userCarts[currentUser] = cart;
        localStorage.setItem('userCarts', JSON.stringify(userCarts));
    }

    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart modal
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        
        // Special multiplication feature: price^quantity
        const multipliedPrice = Math.pow(item.price, item.quantity);
        total += multipliedPrice;

        cartItemElement.innerHTML = `
            <div class="cart-item-info">
                <img src="https://via.placeholder.com/50?text=${item.name.substring(0,1)}" alt="${item.name}">
                <div>
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)} × ${item.quantity} = $${multipliedPrice.toFixed(2)}</p>
                </div>
            </div>
            <div class="cart-item-actions">
                <button class="decrease" data-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button class="increase" data-id="${item.id}">+</button>
                <button class="remove" data-id="${item.id}">×</button>
            </div>
        `;
        cartItems.appendChild(cartItemElement);
    });

    totalAmount.textContent = total.toFixed(2);

    // Add event listeners to new buttons
    document.querySelectorAll('.decrease').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const item = cart.find(item => item.id === id);
            if (item.quantity > 1) {
                updateQuantity(id, item.quantity - 1);
            }
        });
    });

    document.querySelectorAll('.increase').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const item = cart.find(item => item.id === id);
            updateQuantity(id, item.quantity + 1);
        });
    });

    document.querySelectorAll('.remove').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            removeFromCart(id);
        });
    });
}

// Event Listeners
addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        const id = button.getAttribute('data-id');
        const name = button.getAttribute('data-name');
        const price = button.getAttribute('data-price');
        addToCart(id, name, price);
    });
});

cartIcon.addEventListener('click', () => {
    cartModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.style.display = 'none';
    }
});

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    alert(`Thank you for your purchase! Your total is $${totalAmount.textContent}`);
    cart = [];
    updateCart();
    cartModal.style.display = 'none';
});

// Load user cart if logged in
if (currentUser) {
    const userCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
    if (userCarts[currentUser]) {
        cart = userCarts[currentUser];
        updateCart();
    }
}
