import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import cartService from '../services/cartService';
import authService from '../services/authService';
import showNotification from '../utils/notifications';

function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = authService.getCurrentUser();

    const loadCart = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        try {
            const data = await cartService.getCart(user.id);
            setCartItems(data);
        } catch {
            showNotification('Помилка завантаження кошика', 'error');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const handleQuantity = async (cartId, action) => {
        try {
            await cartService.updateQuantity(cartId, action);
            await loadCart();
        } catch (err) {
            const msg = err.response?.data?.detail || 'Помилка оновлення';
            showNotification(msg, 'error');
        }
    };

    const handleRemove = async (cartId) => {
        try {
            await cartService.removeFromCart(cartId);
            showNotification('Товар видалено з кошика', 'info');
            await loadCart();
        } catch {
            showNotification('Не вдалося видалити товар', 'error');
        }
    };

    const totalSum = cartItems.reduce((acc, item) => acc + (item.book.price * item.quantity), 0);

    if (loading) {
        return (
            <main className="container">
                <p style={{ textAlign: 'center', marginTop: '50px' }}>Завантаження кошика...</p>
            </main>
        );
    }

    return (
        <main className="container">
            <Link to="/" className="back-link" style={{ marginTop: '20px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Продовжити покупки
            </Link>

            <h1 style={{ textAlign: 'left', margin: '30px 0' }}>Ваш кошик</h1>

            {cartItems.length === 0 ? (
                <div
                    className="empty-cart-container"
                    style={{
                        textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                    }}
                >
                    <div style={{ marginBottom: '20px', color: '#bdc3c7' }}>
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                    </div>
                    <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>Ваш кошик наразі порожній</h2>
                    <Link to="/" className="btn-primary" style={{ padding: '12px 30px' }}>
                        Перейти до каталогу
                    </Link>
                </div>
            ) : (
                <div
                    className="cart-wrapper"
                    style={{
                        backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}
                >
                    <table className="cart-table">
                        <thead>
                            <tr className="cart-thead-row">
                                <th className="cart-th-left">Книга</th>
                                <th>Ціна</th>
                                <th>Кількість</th>
                                <th>Сума</th>
                                <th aria-label="Дії" />
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map((item) => (
                                <tr key={item.id} className="cart-tbody-row">
                                    <td className="cart-td-book">
                                        <img src={item.book.image_url} alt={item.book.title} className="cart-img" />
                                        <div className="cart-book-title">
                                            <strong>{item.book.title}</strong>
                                            <span className="cart-book-author">{item.book.author}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {item.book.price}
                                        {' '}
                                        грн
                                    </td>
                                    <td>
                                        <div className="cart-qty-wrapper">
                                            <button
                                                type="button"
                                                className="qty-btn"
                                                aria-label="Зменшити кількість"
                                                onClick={() => handleQuantity(item.id, 'decrease')}
                                            >
                                                -
                                            </button>
                                            <span className="qty-num">{item.quantity}</span>
                                            <button
                                                type="button"
                                                className="qty-btn"
                                                aria-label="Збільшити кількість"
                                                onClick={() => handleQuantity(item.id, 'increase')}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </td>
                                    <td className="cart-price-total">
                                        {item.book.price * item.quantity}
                                        {' '}
                                        грн
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn-delete cart-delete-btn"
                                            aria-label="Видалити товар"
                                            onClick={() => handleRemove(item.id)}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="cart-footer">
                        <div>
                            <span className="cart-total-label">Всього: </span>
                            <span className="cart-total-value">
                                {totalSum}
                                {' '}
                                грн
                            </span>
                        </div>
                        <button
                            type="button"
                            className="btn-primary cart-checkout-btn"
                            onClick={() => showNotification('Дякуємо! Ваше замовлення прийнято.', 'success')}
                        >
                            Оформити замовлення
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}

export default CartPage;
