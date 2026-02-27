import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import bookService from '../services/bookService';
import cartService from '../services/cartService';
import authService from '../services/authService';
import BookCard from '../components/BookCard';
import showNotification from '../utils/notifications';

function BookDetailPage() {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [similarBooks, setSimilarBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const bookData = await bookService.getBookById(id);
            setBook(bookData);
            const similar = await bookService.getSimilarBooks(id);
            setSimilarBooks(similar);
        } catch {
            showNotification('Не вдалося завантажити дані', 'error');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddToCart = async () => {
        const user = authService.getCurrentUser();

        if (!user) {
            showNotification('Будь ласка, увійдіть в акаунт для покупок', 'info');
            return;
        }

        try {
            await cartService.addToCart(book.id, user.id);
            showNotification('Книгу додано до кошика!', 'success');
        } catch {
            showNotification('Не вдалося додати книгу', 'error');
        }
    };

    if (loading) {
        return (
            <main className="container">
                <p style={{ textAlign: 'center', marginTop: '50px' }}>
                    Завантаження інформації про книгу...
                </p>
            </main>
        );
    }

    if (!book) return <main className="container"><p>Книгу не знайдено</p></main>;

    return (
        <main className="container">
            <Link to="/" className="back-link" style={{ marginTop: '20px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Назад до каталогу
            </Link>

            <section className="book-details-wrapper">
                <div className="book-cover-column">
                    <img src={book.image_url} alt={book.title} />
                    <span className="book-price-large">
                        {book.price}
                        {' '}
                        грн
                    </span>
                    <button
                        type="button"
                        className="btn-primary btn-full"
                        onClick={handleAddToCart}
                    >
                        Додати в кошик
                    </button>
                </div>
                <div className="book-info-column">
                    <h1>{book.title}</h1>
                    <table className="info-table">
                        <tbody>
                            <tr>
                                <td><strong>Автор:</strong></td>
                                <td>{book.author}</td>
                            </tr>
                            <tr>
                                <td><strong>Жанр:</strong></td>
                                <td>{book.genre || 'Класика'}</td>
                            </tr>
                            <tr>
                                <td><strong>Видавництво:</strong></td>
                                <td>{book.publisher || 'Знання'}</td>
                            </tr>
                            <tr>
                                <td><strong>Мова:</strong></td>
                                <td>{book.language || 'Українська'}</td>
                            </tr>
                            <tr>
                                <td><strong>В наявності:</strong></td>
                                <td>
                                    {book.stock}
                                    {' '}
                                    шт.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="annotation-section">
                        <h3>Анотація</h3>
                        <p>{book.description}</p>
                    </div>
                </div>
            </section>

            <section className="similar-products">
                <h2>Схожі товари</h2>
                <div className="book-grid">
                    {similarBooks.length > 0 ? (
                        similarBooks.map((item) => (
                            <BookCard key={item.id} book={item} />
                        ))
                    ) : (
                        <p className="loading-text">Шукаємо схожі книги...</p>
                    )}
                </div>
            </section>
        </main>
    );
}

export default BookDetailPage;
