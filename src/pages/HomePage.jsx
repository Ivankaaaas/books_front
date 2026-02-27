import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import BookCard from '../components/BookCard';
import bookService from '../services/bookService';
import showNotification from '../utils/notifications';

function HomePage({ searchQuery }) {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('none');

    const loadBooks = useCallback(async () => {
        try {
            setLoading(true);
            const data = await bookService.getAllBooks();
            setBooks(data);
        } catch {
            showNotification('Не вдалося завантажити каталог книг', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBooks();
    }, [loadBooks]);

    const filteredBooks = books
        .filter((book) => {
            const lowerQuery = (searchQuery || '').toLowerCase();
            return book.title.toLowerCase().includes(lowerQuery)
                || book.author.toLowerCase().includes(lowerQuery);
        })
        .sort((a, b) => {
            if (sortOrder === 'asc') return a.price - b.price;
            if (sortOrder === 'desc') return b.price - a.price;
            return 0;
        });

    return (
        <main className="container">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '30px',
                marginBottom: '20px',
            }}
            >
                <h1 style={{ margin: 0 }}>Наші книги</h1>
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="sort-select"
                    style={{ padding: '8px', borderRadius: '4px' }}
                >
                    <option value="none">Без сортування</option>
                    <option value="asc">Дешевші спочатку</option>
                    <option value="desc">Дорожчі спочатку</option>
                </select>
            </div>

            <div className="book-grid">
                {filteredBooks.map((book) => (
                    <BookCard key={book.id} book={book} />
                ))}
            </div>

            {loading && <p style={{ textAlign: 'center', marginTop: '50px' }}>Завантаження...</p>}
        </main>
    );
}

HomePage.propTypes = {
    searchQuery: PropTypes.string.isRequired,
};

export default HomePage;
