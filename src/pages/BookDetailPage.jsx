import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import bookService from '../services/bookService';
import cartService from '../services/cartService';
import authService from '../services/authService';
import BookCard from '../components/BookCard';
import showNotification from '../utils/notifications';

function BookDetailPage() {
    const { id } = useParams();
    const user = authService.getCurrentUser();

    const [book, setBook] = useState(null);
    const [similarBooks, setSimilarBooks] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [isHoveredToggle, setIsHoveredToggle] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const bookData = await bookService.getBookById(id);
            setBook(bookData);

            const similar = await bookService.getSimilarBooks(id);
            setSimilarBooks(similar);

            const reviewsData = await bookService.getBookReviews(id);
            setReviews(reviewsData);
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

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            showNotification('Будь ласка, поставте оцінку', 'info');
            return;
        }
        try {
            await bookService.addReview({
                book_id: parseInt(id, 10),
                user_id: user.id,
                text: reviewText,
                rating,
            });
            showNotification('Відгук додано!', 'success');
            setReviewText('');
            setRating(0);
            const updated = await bookService.getBookReviews(id);
            setReviews(updated);
        } catch {
            showNotification('Помилка при додаванні відгуку', 'error');
        }
    };

    if (loading) return <main className="container"><p style={{ textAlign: 'center', marginTop: '50px' }}>Завантаження...</p></main>;
    if (!book) return <main className="container"><p>Книгу не знайдено</p></main>;

    return (
        <main className="container">
            <Link to="/" className="back-link">← Назад до каталогу</Link>

            <section className="book-details-wrapper">
                <div className="book-cover-column">
                    <img src={book.image_url || book.image} alt={book.title} />
                    <span className="book-price-large">
                        {book.price}
                        {' '}
                        грн
                    </span>
                    <button type="button" className="btn-primary btn-full" onClick={handleAddToCart}>
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

            <hr className="divider" />

            <section className="reviews-section">
                <h2>
                    Відгуки покупців (
                    {reviews.length}
                    )
                </h2>

                {user ? (
                    <form className="review-form" onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="review-form-header">
                            <div className="star-rating" style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                {[1, 2, 3, 4, 5].map((num) => {
                                    const isFilled = (hoverRating || rating) >= num;
                                    const isHovering = hoverRating >= num;

                                    let fillColor = 'none';
                                    if (isFilled) {
                                        fillColor = isHovering ? '#d8e69f' : '#ffcc00';
                                    }
                                    let strokeColor = '#ccc';
                                    if (isFilled) {
                                        strokeColor = isHovering ? '#d8e69f' : '#ffcc00';
                                    }

                                    return (
                                        <button
                                            key={num}
                                            type="button"
                                            aria-label={`Оцінка ${num}`}
                                            onMouseEnter={() => setHoverRating(num)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(num)}
                                            style={{
                                                background: 'none', border: 'none', padding: 0, margin: 0, outline: 'none', cursor: 'pointer', lineHeight: 0,
                                            }}
                                        >
                                            <svg width="28" height="28" viewBox="0 0 24 24" style={{ transition: 'all 0.2s ease' }}>
                                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill={fillColor} stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="review-input-group" style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                            <textarea
                                placeholder="Напишіть свій відгук (необов'язково)..."
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                style={{
                                    flex: 1, minHeight: '42px', padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit', outline: 'none', resize: 'vertical',
                                }}
                            />
                            <button
                                type="submit"
                                className="btn-primary"
                                style={{
                                    margin: 0, height: '42px', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', fontSize: '0.9rem', minWidth: '120px',
                                }}
                            >
                                Надіслати
                            </button>
                        </div>
                    </form>
                ) : (
                    <p className="auth-note">Тільки авторизовані користувачі можуть залишати відгуки.</p>
                )}

                <div className="reviews-list" style={{ marginTop: '30px' }}>
                    {reviews.length > 0 ? (
                        <>
                            {[...reviews]
                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                .slice(0, showAllReviews ? reviews.length : 2)
                                .map((rev) => (
                                    <div
                                        key={rev.id}
                                        className="review-item"
                                        style={{
                                            background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '15px',
                                        }}
                                    >
                                        <div className="review-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <strong>{rev.user_name}</strong>
                                            <span style={{ color: '#ffcc00', marginLeft: '10px' }}>
                                                {'★'.repeat(rev.rating)}
                                                {'☆'.repeat(5 - rev.rating)}
                                            </span>
                                            <span style={{ color: '#999', fontSize: '0.85rem', marginLeft: 'auto' }}>
                                                {new Date(rev.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {rev.text && <p style={{ margin: 0, color: '#444' }}>{rev.text}</p>}
                                    </div>
                                ))}
                            {reviews.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => setShowAllReviews(!showAllReviews)}
                                    onMouseEnter={() => setIsHoveredToggle(true)}
                                    onMouseLeave={() => setIsHoveredToggle(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: isHoveredToggle ? '#d8e69f' : '#0056b3',
                                        cursor: 'pointer',
                                        padding: '5px 0',
                                        fontSize: '0.95rem',
                                        textDecoration: 'none',
                                        transition: 'color 0.3s ease',
                                    }}
                                >
                                    {showAllReviews ? 'Приховати відгуки' : `Показати ще ${reviews.length - 2} відгуків`}
                                </button>
                            )}
                        </>
                    ) : (
                        <p>Поки що немає відгуків. Будьте першим!</p>
                    )}
                </div>
            </section>

            <section className="similar-products">
                <h2>Схожі товари</h2>
                <div className="book-grid">
                    {similarBooks.length > 0 ? (
                        similarBooks.map((item) => <BookCard key={item.id} book={item} />)
                    ) : (
                        <p className="loading-text">Шукаємо схожі книги...</p>
                    )}
                </div>
            </section>
        </main>
    );
}

export default BookDetailPage;
