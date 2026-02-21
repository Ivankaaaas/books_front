const API_URL = 'http://127.0.0.1:8000/api';

const getUser = () => JSON.parse(localStorage.getItem('user'));

function showNotification(message, type = 'info') {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerText = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function logout() {
    localStorage.removeItem('user');
    showNotification('Ви вийшли з акаунту', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 800);
}

function toggleEdit(id) {
    const input = document.getElementById(id);
    if (!input) return;
    input.readOnly = false;
    input.style.backgroundColor = '#fff';
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) saveBtn.style.display = 'block';
    input.focus();
}

function renderBooks(books) {
    const container = document.querySelector('.book-grid');
    if (!container) return;
    container.innerHTML = '';
    books.forEach((book) => {
        const bookCard = `
            <article class="book-card">
                <a href="book-details.html?id=${book.id}" class="book-card-link">
                    <img src="${book.image_url || 'https://uabooks.net/posters/210.jpg'}" alt="${book.title}">
                    <div class="book-card-info">
                        <h2>${book.title}</h2>
                        <p class="author">${book.author}</p>
                        <p>Ціна: ${book.price} грн</p>
                    </div>
                </a>
                <button class="btn-primary" onclick="addToCart(${book.id})">У кошик</button>
            </article>
        `;
        container.insertAdjacentHTML('beforeend', bookCard);
    });
}

function renderBookDetails(book) {
    const container = document.getElementById('book-details-container');
    if (!container) return;

    container.innerHTML = `
        <div class="book-cover-column">
            <img src="${book.image_url || 'https://uabooks.net/posters/210.jpg'}" alt="${book.title}">
            <span class="book-price-large">${book.price} грн</span>
        </div>
        <div class="book-info-column">
            <h1>${book.title}</h1>
            <table class="info-table">
                <tr><td class="info-label">Автор:</td><td>${book.author}</td></tr>
                <tr><td class="info-label">Жанр:</td><td>${book.genre || 'Класика'}</td></tr>
                <tr><td class="info-label">Видавництво:</td><td>${book.publisher || 'Не вказано'}</td></tr>
                <tr><td class="info-label">Мова:</td><td>${book.language || 'Українська'}</td></tr>
                <tr><td class="info-label">В наявності:</td><td>${book.stock} шт.</td></tr>
            </table>
            <div class="annotation-section">
                <h3>Анотація</h3>
                <p>${book.description || 'Опис відсутній.'}</p>
            </div>
            <button class="btn-primary" onclick="addToCart(${book.id})">У кошик</button>
        </div>
    `;
}

function renderCart(items) {
    const container = document.getElementById('cart-items-container');
    const mainContent = document.getElementById('cart-main-content');
    const loader = document.getElementById('cart-loader');
    const totalLabel = document.querySelector('.cart-total-value');
    const cartWrapper = document.querySelector('.cart-wrapper');

    if (!container || !mainContent) return;

    if (loader) loader.style.display = 'none';

    if (!items || items.length === 0) {
        mainContent.style.display = 'block';
        cartWrapper.innerHTML = `
            <div class="empty-cart-container" style="text-align: center; padding: 50px 20px;">
                <div class="empty-cart-icon" style="margin-bottom: 20px; opacity: 0.5;">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#2c3e50" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                </div>
                <h2 style="color: #2c3e50; margin-bottom: 10px;">Ваш кошик наразі порожній</h2>
                <a href="index.html" class="btn-primary">Перейти до каталогу</a>
            </div>
        `;
        return;
    }

    mainContent.style.display = 'block';
    container.innerHTML = '';
    let totalSum = 0;

    items.forEach((item) => {
        const { book } = item;
        if (!book) return;

        const lineTotal = (book.price || 0) * (item.quantity || 1);
        totalSum += lineTotal;

        const row = `
            <tr class="cart-tbody-row">
                <td class="cart-td-book">
                    <a href="book-details.html?id=${book.id}">
                        <img src="${book.image_url}" class="cart-img" alt="Обкладинка">
                    </a>
                    <div style="display: flex; flex-direction: column; justify-content: center;">
                        <a href="book-details.html?id=${book.id}" class="cart-book-title">
                            <strong>${book.title}</strong>
                        </a>
                        <small class="cart-book-author">${book.author}</small>
                    </div>
                </td>
                <td>${book.price} грн</td>
                <td>
                    <div class="cart-qty-wrapper">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 'decrease')">-</button>
                        <span class="qty-num">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 'increase')">+</button>
                    </div>
                </td>
                <td class="cart-price-total">${lineTotal} грн</td>
                <td>
                    <button class="btn-delete cart-delete-btn" onclick="removeFromCart(${item.id})">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
        container.insertAdjacentHTML('beforeend', row);
    });

    if (totalLabel) totalLabel.innerText = `${totalSum} грн`;
}

function updateGrandTotal() {
    let sum = 0;
    document.querySelectorAll('.cart-price-total').forEach((el) => {
        sum += parseInt(el.innerText, 10);
    });
    const totalLabel = document.querySelector('.cart-total-value');
    if (totalLabel) totalLabel.innerText = `${sum} грн`;
}

async function addToCart(bookId) {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || !user.id) {
        showNotification('Будь ласка, увійдіть в акаунт для покупок', 'info');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/cart/add?book_id=${bookId}&user_id=${user.id}`, {
            method: 'POST',
        });

        if (response.ok) {
            showNotification('Книгу додано до кошика!', 'success');
        } else {
            const errorData = await response.json();
            showNotification(errorData.detail || 'Не вдалося додати книгу', 'error');
        }
    } catch (_error) {
        showNotification('Помилка з’єднання з сервером', 'error');
    }
}

async function updateQuantity(cartItemId, action) {
    const deleteBtn = document.querySelector(`button[onclick*="${cartItemId}"]`);
    if (!deleteBtn) return;

    const row = deleteBtn.closest('tr');
    const qtySpan = row.querySelector('.qty-num');
    const priceTotalTd = row.querySelector('.cart-price-total');
    const pricePerUnit = parseInt(row.cells[1].innerText, 10);

    let currentQty = parseInt(qtySpan.innerText, 10);
    const oldQty = currentQty;

    if (action === 'increase') {
        currentQty += 1;
    } else if (action === 'decrease') {
        if (currentQty > 1) {
            currentQty -= 1;
        } else {
            if (!window.confirm('Видалити книгу з кошика?')) return;
            row.style.display = 'none';
        }
    }

    if (currentQty > 0) {
        qtySpan.innerText = currentQty;
        priceTotalTd.innerText = `${currentQty * pricePerUnit} грн`;
    }
    updateGrandTotal();

    try {
        const response = await fetch(`${API_URL}/cart/update/${cartItemId}?action=${action}`, {
            method: 'PATCH',
        });

        if (!response.ok) {
            const errorData = await response.json();
            showNotification(errorData.detail || 'Сталася помилка', 'error');

            if (action === 'decrease' && oldQty === 1) {
                row.style.display = 'table-row';
            } else {
                qtySpan.innerText = oldQty;
                priceTotalTd.innerText = `${oldQty * pricePerUnit} грн`;
            }
            updateGrandTotal();
        } else if (action === 'decrease' && oldQty === 1) {
            row.remove();
            const remainingRows = document.querySelectorAll('.cart-tbody-row');
            if (remainingRows.length === 0) {
                renderCart([]);
            }
        }
    } catch (_error) {
        showNotification('Проблема з’єднання з сервером', 'error');
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }
}

async function removeFromCart(cartItemId) {
    const deleteBtn = document.querySelector(`button[onclick="removeFromCart(${cartItemId})"]`);
    const row = deleteBtn ? deleteBtn.closest('tr') : null;

    if (row) {
        row.style.opacity = '0.3';
    }

    try {
        const response = await fetch(`${API_URL}/cart/${cartItemId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            if (row) row.remove();
            updateGrandTotal();
            const remainingRows = document.querySelectorAll('.cart-tbody-row');
            if (remainingRows.length === 0) {
                renderCart([]);
            }
            showNotification('Книгу видалено', 'info');
        } else {
            const errorData = await response.json();
            showNotification(errorData.detail || 'Не вдалося видалити книгу', 'error');
            if (row) row.style.opacity = '1';
        }
    } catch (_error) {
        showNotification('Помилка з’єднання при видаленні', 'error');
        if (row) row.style.opacity = '1';
    }
}

async function fetchBooks() {
    try {
        const response = await fetch(`${API_URL}/books`);
        const books = await response.json();
        renderBooks(books);
    } catch (_error) { showNotification('Не вдалося завантажити каталог', 'error'); }
}

async function fetchMainBookData(bookId) {
    try {
        const response = await fetch(`${API_URL}/books/${bookId}`);
        const book = await response.json();
        renderBookDetails(book);
    } catch (_error) {
        showNotification('Не вдалося завантажити деталі книги', 'error');
    }
}

async function fetchSimilarBooks(currentBookId) {
    const container = document.getElementById('similar-books-grid');
    if (!container) return;

    container.innerHTML = '<p class="loading-text">Завантаження схожих товарів...</p>';

    try {
        if (!currentBookId) {
            container.innerHTML = '';
            return;
        }

        const response = await fetch(`${API_URL}/books/random/similar?exclude_id=${currentBookId}`);
        if (!response.ok) {
            throw new Error('Помилка сервера');
        }

        const books = await response.json();

        if (books.length === 0) {
            container.innerHTML = '<p>Схожих книг не знайдено</p>';
            return;
        }

        container.innerHTML = books.map((book) => `
            <article class="book-card">
                <a href="book-details.html?id=${book.id}" class="book-card-link">
                    <img src="${book.image_url || 'https://uabooks.net/posters/210.jpg'}" alt="${book.title}">
                    <div class="book-card-info">
                        <h2>${book.title}</h2>
                        <p class="author">${book.author}</p>
                        <p class="price">Ціна: ${book.price} грн</p>
                    </div>
                </a>
                <button class="btn-primary" onclick="addToCart(${book.id})">У кошик</button>
            </article>
        `).join('');
    } catch (_error) {
        container.innerHTML = '<p>Не вдалося завантажити схожі товари</p>';
        showNotification('Помилка завантаження схожих книг', 'info');
    }
}

async function fetchBookDetails() {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get('id');

    if (!bookId) return;

    fetchMainBookData(bookId);
    fetchSimilarBooks(bookId);
}

async function fetchCart() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || !user.id) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/cart?user_id=${user.id}`);

        if (response.ok) {
            const items = await response.json();
            renderCart(items);
        } else {
            showNotification('Не вдалося завантажити дані кошика', 'error');
        }
    } catch (_error) {
        showNotification('Проблема з’єднання з сервером при оновленні кошика', 'error');
    }
}

async function fetchAllUsers() {
    const container = document.querySelector('.user-list');
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/users`);
        if (!response.ok) {
            throw new Error('Помилка сервера');
        }
        const users = await response.json();
        container.innerHTML = '';

        users.forEach((u) => {
            const isAdmin = u.role === 'admin';
            const userCard = `
                <article class="user-card ${isAdmin ? 'admin-border' : 'regular-border'}">
                    <h3>${u.first_name} ${u.last_name}</h3>
                    <p>Email: ${u.email}</p>
                    <p>Роль: <strong class="${isAdmin ? 'role-admin' : 'role-regular'}">${u.role}</strong></p>
                    <a href="edit-user.html?id=${u.id}" class="btn-primary">Редагувати</a>
                </article>
            `;
            container.insertAdjacentHTML('beforeend', userCard);
        });
    } catch (_error) {
        showNotification('Не вдалося завантажити список користувачів', 'error');
    }
}

async function initEditUser() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    if (!userId) return;

    const nameDisplay = document.getElementById('user-name-display');
    const roleSelect = document.getElementById('user-role');
    const editForm = document.getElementById('edit-user-form');
    const deleteBtn = document.getElementById('delete-user-btn');

    try {
        const response = await fetch(`${API_URL}/users/${userId}`);
        if (!response.ok) throw new Error('User not found');
        const user = await response.json();

        nameDisplay.innerText = `${user.first_name} ${user.last_name}`;
        roleSelect.value = user.role;
    } catch (_error) { showNotification('Не вдалося завантажити дані користувача', 'error'); }
    if (editForm) {
        editForm.onsubmit = async (e) => {
            e.preventDefault();
            try {
                const response = await fetch(`${API_URL}/users/${userId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role: roleSelect.value }),
                });

                if (response.ok) {
                    showNotification('Роль успішно оновлено!', 'success');
                    setTimeout(() => {
                        window.location.href = 'users.html';
                    }, 1000);
                } else {
                    showNotification('Помилка оновлення ролі', 'error');
                }
            } catch (_error) {
                showNotification('Сервер не відповідає', 'error');
            }
        };
    }

    if (deleteBtn) {
        deleteBtn.onclick = async () => {
            if (!window.confirm('Ви впевнені, що хочете видалити цього користувача?')) return;

            try {
                const response = await fetch(`${API_URL}/users/${userId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    showNotification('Користувача видалено', 'info');
                    setTimeout(() => {
                        window.location.href = 'users.html';
                    }, 1000);
                } else {
                    showNotification('Не вдалося видалити користувача', 'error');
                }
            } catch (_error) {
                showNotification('Помилка при видаленні', 'error');
            }
        };
    }
}

function initProfile() {
    const storageData = getUser();
    if (!storageData) return;

    const user = storageData.user || storageData;

    const fNameInput = document.getElementById('profile-first-name');
    const lNameInput = document.getElementById('profile-last-name');
    const emailInput = document.getElementById('profile-email');

    if (fNameInput) fNameInput.value = user.first_name || '';
    if (lNameInput) lNameInput.value = user.last_name || '';
    if (emailInput) emailInput.value = user.email || '';

    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.onsubmit = async (e) => {
            e.preventDefault();
            try {
                const response = await fetch(`${API_URL}/users/${user.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        first_name: fNameInput.value,
                        last_name: lNameInput.value,
                    }),
                });
                if (response.ok) {
                    const newUser = await response.json();
                    const updatedData = { ...user, ...newUser, isLoggedIn: true };
                    localStorage.setItem('user', JSON.stringify(updatedData));
                    showNotification('Дані успішно оновлено!', 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    showNotification('Не вдалося зберегти зміни', 'error');
                }
            } catch (_error) { showNotification('Помилка з’єднання з сервером', 'error'); }
        };
    }
}

function setupNavigation() {
    const user = getUser();
    const adminLink = document.getElementById('admin-nav-link');

    if (!adminLink) return;

    if (user && user.role === 'admin') {
        adminLink.style.display = 'block';
    } else {
        adminLink.style.display = 'none';
    }
}

function setupProfileButton() {
    const user = getUser();
    const profileLink = document.querySelector('a[href="login.html"]');
    if (user && profileLink) {
        profileLink.href = 'profile.html';
        profileLink.title = 'Мій профіль';
    }
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const firstName = document.getElementById('first_name').value;
        const lastName = document.getElementById('last_name').value;
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            showNotification('Паролі не збігаються!', 'error');
            return;
        }

        const userData = {
            first_name: firstName,
            last_name: lastName,
            email,
            password,
        };

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify({ ...data, isLoggedIn: true }));
                showNotification('Реєстрація успішна!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
            } else {
                showNotification(data.detail || 'Не вдалося зареєструватися', 'error');
            }
        } catch (_error) {
            showNotification('Сервер не відповідає. Спробуйте пізніше.', 'error');
        }
    });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const errorBlock = document.getElementById('login-error');
        const errorText = document.getElementById('error-message');

        if (errorBlock) {
            errorBlock.style.display = 'none';
        }

        try {
            const response = await fetch(`${API_URL}/login_json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify({ ...data, isLoggedIn: true }));
                showNotification('Вхід успішний!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
            } else {
                if (errorBlock && errorText) {
                    errorText.innerText = data.detail || 'Невірний email або пароль';
                    errorBlock.style.display = 'flex';
                }
                showNotification('Помилка авторизації', 'error');
            }
        } catch (_error) {
            showNotification('Сервер не відповідає', 'error');
            if (errorBlock) {
                errorText.innerText = 'Технічна помилка на сервері';
                errorBlock.style.display = 'flex';
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    const currentPath = window.location.pathname;

    const adminLink = document.getElementById('admin-nav-link');
    if (adminLink) {
        if (user && user.isLoggedIn && user.role === 'admin') {
            adminLink.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
        }
    }

    const profileLink = document.querySelector('a[href="login.html"]');
    if (user && user.isLoggedIn && profileLink) {
        profileLink.href = 'profile.html';
        profileLink.title = 'Мій профіль';
    }

    if (currentPath.includes('index.html') || currentPath === '/' || currentPath.endsWith('index.html')) {
        if (document.querySelector('.book-grid')) {
            fetchBooks();
        }
    }

    if (document.getElementById('book-details-container')) {
        fetchBookDetails();
    }

    if (document.getElementById('cart-items-container')) {
        fetchCart();
    }

    if (currentPath.includes('profile.html')) {
        initProfile();
    }

    if (currentPath.includes('edit-user.html')) {
        initEditUser();
    }

    if (currentPath.includes('users.html')) {
        if (!user || user.role !== 'admin' || !user.isLoggedIn) {
            showNotification('У вас немає прав для перегляду цієї сторінки!', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            fetchAllUsers();
        }
    }
});

window.logout = logout;
window.toggleEdit = toggleEdit;
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.setupNavigation = setupNavigation;
window.setupProfileButton = setupProfileButton;
