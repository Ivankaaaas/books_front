import React, { useEffect, useState, useCallback } from 'react';
import BookCard from '../components/BookCard';
import bookService from '../services/bookService';
import showNotification from '../utils/notifications';

function HomePage() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const isEmpty = !loading && books.length === 0;

    return (
        <main className="container">
            <h1 style={{ marginTop: '20px' }}>Наші книги</h1>

            <div className="book-grid">
                {books.map((book) => (
                    <BookCard key={book.id} book={book} />
                ))}
            </div>

            {loading && (
                <p style={{ textAlign: 'center', marginTop: '50px' }}>
                    Завантаження книг...
                </p>
            )}

            {isEmpty && (
                <p style={{ textAlign: 'center', marginTop: '50px' }}>
                    Каталог книг порожній.
                </p>
            )}
        </main>
    );
}

export default HomePage;
