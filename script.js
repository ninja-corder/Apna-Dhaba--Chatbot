// DOM Elements
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');
const menuGrid = document.getElementById('menuGrid');
const cartIcon = document.getElementById('cartIcon');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeLogin = document.getElementById('closeLogin');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const orderNowBtn = document.getElementById('orderNowBtn');
const chatIcon = document.getElementById('chatIcon');
const chatWindow = document.getElementById('chatWindow');
const closeChat = document.getElementById('closeChat');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendMessage = document.getElementById('sendMessage');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const confirmOrder = document.getElementById('confirmOrder');
const checkoutSummary = document.getElementById('checkoutSummary');
const profileForm = document.getElementById('profileForm');
const ordersList = document.getElementById('ordersList');
const filterBtns = document.querySelectorAll('.filter-btn');

// App State
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let user = JSON.parse(localStorage.getItem('user')) || null;
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let menuItems = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Load menu items
    fetchMenuItems();
    
    // Load user data if logged in
    if (user) {
        updateUserUI();
    }
    
    // Load orders if user is logged in
    if (user) {
        loadOrders();
    }
    
    // Update cart count
    updateCartCount();
});

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('data-section');
        
        // Update active nav link
        navLinks.forEach(navLink => navLink.classList.remove('active'));
        link.classList.add('active');
        
        // Show selected section
        sections.forEach(section => section.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');
    });
});

// Load menu items from JSON (simulating API call)
function fetchMenuItems() {
    fetch('assets/data/menu.json')
        .then(response => response.json())
        .then(data => {
            menuItems = data;
            renderMenuItems(data);
        })
        .catch(error => {
            console.error('Error loading menu items:', error);
            // Fallback data if JSON fails to load
            menuItems = getFallbackMenuItems();
            renderMenuItems(menuItems);
        });
}

function renderMenuItems(items) {
    menuGrid.innerHTML = '';
    
    items.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.dataset.category = item.category;
        menuItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-info">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="item-footer">
                    <span>${formatPrice(item.price)}</span>
                    <button class="add-to-cart" data-id="${item.id}">Add to Cart</button>
                </div>
            </div>
        `;
        menuGrid.appendChild(menuItem);
    });
    
    // Add event listeners to add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

// Filter menu items
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const category = btn.dataset.category;
        if (category === 'all') {
            renderMenuItems(menuItems);
        } else {
            const filteredItems = menuItems.filter(item => item.category === category);
            renderMenuItems(filteredItems);
        }
    });
});

// Cart functionality
function addToCart(e) {
    const itemId = parseInt(e.target.dataset.id);
    const item = menuItems.find(item => item.id === itemId);
    
    // Check if item already in cart
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }
    
    updateCart();
    showToast(`${item.name} added to cart`);
}

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    updateCartCount();
}

function renderCartItems() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
        return;
    }
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.name}</h4>
                <p class="cart-item-price">${formatPrice(item.price * item.quantity)}</p>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
                <button class="remove-item" data-id="${item.id}">Remove</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `${formatPrice(total)}`;
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', decreaseQuantity);
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', increaseQuantity);
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', removeItem);
    });
}

function decreaseQuantity(e) {
    const itemId = parseInt(e.target.dataset.id);
    const item = cart.find(item => item.id === itemId);
    
    if (item.quantity > 1) {
        item.quantity -= 1;
    } else {
        cart = cart.filter(item => item.id !== itemId);
    }
    
    updateCart();
}

function increaseQuantity(e) {
    const itemId = parseInt(e.target.dataset.id);
    const item = cart.find(item => item.id === itemId);
    item.quantity += 1;
    updateCart();
}

function removeItem(e) {
    const itemId = parseInt(e.target.dataset.id);
    cart = cart.filter(item => item.id !== itemId);
    updateCart();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector('.cart-count').textContent = count;
}

// Cart sidebar toggle
cartIcon.addEventListener('click', () => {
    cartSidebar.classList.add('active');
});

closeCart.addEventListener('click', () => {
    cartSidebar.classList.remove('active');
});

// Checkout functionality
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
    }
    
    if (!user) {
        showToast('Please login to checkout');
        loginModal.classList.add('active');
        cartSidebar.classList.remove('active');
        return;
    }
    
    showCheckoutSummary();
    checkoutModal.classList.add('active');
    cartSidebar.classList.remove('active');
});

function showCheckoutSummary() {
    checkoutSummary.innerHTML = '';
    
    cart.forEach(item => {
        const summaryItem = document.createElement('div');
        summaryItem.className = 'summary-item';
        summaryItem.innerHTML = `
            <span>${item.name} x ${item.quantity}</span>
            <span>${formatPrice(item.price * item.quantity)}</span>
        `;
        checkoutSummary.appendChild(summaryItem);
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const summaryTotal = document.createElement('div');
    summaryTotal.className = 'summary-total';
    summaryTotal.innerHTML = `
        <span>Total</span>
        <span>$${total.toFixed(2)}</span>
    `;
    checkoutSummary.appendChild(summaryTotal);
}

confirmOrder.addEventListener('click', () => {
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const order = {
        id: Date.now(),
        date: new Date().toISOString(),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'Processing',
        paymentMethod
    };
    
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    cart = [];
    updateCart();
    
    checkoutModal.classList.remove('active');
    showToast('Order placed successfully!');
    
    // Update orders list if on orders page
    if (document.querySelector('.section.active').id === 'orders') {
        loadOrders();
    }
});

closeCheckout.addEventListener('click', () => {
    checkoutModal.classList.remove('active');
});

// User authentication
loginBtn.addEventListener('click', () => {
    loginModal.classList.add('active');
});

closeLogin.addEventListener('click', () => {
    loginModal.classList.remove('active');
});

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

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simple validation
    if (!email || !password) {
        showToast('Please fill in all fields');
        return;
    }
    
    // Simulate login
    user = {
        email,
        name: 'John Doe',
        phone: '123-456-7890',
        address: '123 Main St, City'
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    updateUserUI();
    loginModal.classList.remove('active');
    showToast('Login successful');
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;
    
    // Simple validation
    if (!name || !email || !password || !confirm) {
        showToast('Please fill in all fields');
        return;
    }
    
    if (password !== confirm) {
        showToast('Passwords do not match');
        return;
    }
    
    // Simulate registration
    user = {
        email,
        name,
        phone: '',
        address: ''
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    updateUserUI();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    showToast('Registration successful');
});

function updateUserUI() {
    if (user) {
        loginBtn.textContent = 'Logout';
        loginBtn.removeEventListener('click', () => {});
        loginBtn.addEventListener('click', logout);
        
        // Update profile form if user data exists
        if (document.getElementById('profile').classList.contains('active')) {
            document.getElementById('name').value = user.name || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('address').value = user.address || '';
        }
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.removeEventListener('click', logout);
        loginBtn.addEventListener('click', () => {
            loginModal.classList.add('active');
        });
    }
}

function logout() {
    user = null;
    localStorage.removeItem('user');
    updateUserUI();
    showToast('Logged out successfully');
}

// Profile form
profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!user) {
        showToast('Please login to update profile');
        return;
    }
    
    user = {
        ...user,
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    showToast('Profile updated successfully');
});

// Orders
function loadOrders() {
    ordersList.innerHTML = '';
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p>No past orders found</p>';
        return;
    }
    
    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <span>Order #${order.id}</span>
                <span>${new Date(order.date).toLocaleDateString()}</span>
            </div>
            <div class="order-status">Status: ${order.status}</div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                Total: ${formatPrice(order.total)} (${order.paymentMethod})
            </div>
        `;
        ordersList.appendChild(orderCard);
    });
}

// Chatbot


// Order now button
orderNowBtn.addEventListener('click', () => {
    document.querySelector('.nav-link[data-section="menu"]').click();
});

// Helper functions
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

function formatPrice(amount) {
    return `₹${amount.toFixed(2)}`;
}


// Fallback menu data
function getFallbackMenuItems() {
    return [
        {
            id: 1,
            name: "Pav Bhaji",
            description: "Delicious mashed vegetable curry served with buttered buns",
            price: 50.00,
            category: "indian",
            image: "https://source.unsplash.com/random/300x200/?pavbhaji"
        },
        {
            id: 2,
            name: "Chole Bhature",
            description: "Spicy chickpea curry with deep-fried bread",
            price: 90.00,
            category: "indian",
            image: "https://source.unsplash.com/random/300x200/?cholebhature"
        },
        {
            id: 3,
            name: "Pizza",
            description: "Classic pizza with cheese and toppings of your choice",
            price: 100.00,
            category: "italian",
            image: "https://source.unsplash.com/random/300x200/?pizza"
        },
        {
            id: 4,
            name: "Mango Lassi",
            description: "Refreshing yogurt drink with sweet mango pulp",
            price: 40.00,
            category: "beverage",
            image: "https://source.unsplash.com/random/300x200/?mangolassi"
        },
        {
            id: 5,
            name: "Masala Dosa",
            description: "Crispy rice crepe filled with spiced potato mixture",
            price: 60.00,
            category: "south indian",
            image: "https://source.unsplash.com/random/300x200/?masaladosa"
        },
        {
            id: 6,
            name: "Vegetable Biryani",
            description: "Fragrant rice cooked with mixed vegetables and spices",
            price: 50.00,
            category: "indian",
            image: "https://source.unsplash.com/random/300x200/?vegetablebiryani"
        },
        {
            id: 7,
            name: "Vada Pav",
            description: "Spicy potato fritter sandwiched in a bun",
            price: 30.00,
            category: "street food",
            image: "https://source.unsplash.com/random/300x200/?vadapav"
        },
        {
            id: 8,
            name: "Rava Dosa",
            description: "Crispy semolina crepe served with chutney and sambar",
            price: 70.00,
            category: "south indian",
            image: "https://source.unsplash.com/random/300x200/?ravadosa"
        },
        {
            id: 9,
            name: "Samosa",
            description: "Crispy pastry filled with spiced potatoes and peas",
            price: 25.00,
            category: "snack",
            image: "https://source.unsplash.com/random/300x200/?samosa"
        }
    ];
}