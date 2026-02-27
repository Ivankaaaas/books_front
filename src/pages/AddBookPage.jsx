import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bookService from '../services/bookService';
import showNotification from '../utils/notifications';

function AddBookPage() {
    const navigate = useNavigate();

    const [bookData, setBookData] = useState({
        title: '',
        author: '',
        price: '',
        image: '',
        genre: '',
        publisher: '',
        language: '',
        description: '',
        count: 0,
    });

    const handleChange = (e) => {
        const {
            name, value, type, checked,
        } = e.target;
        setBookData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await bookService.createBook(bookData);
            showNotification('Книгу успішно додано!', 'success');
            navigate('/');
        } catch {
            showNotification('Помилка при додаванні книги', 'error');
        }
    };

    return (
        <main className="container">
            <div className="auth-card" style={{ maxWidth: '600px' }}>
                <h1>Додати нову книгу</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">
                            Назва книги
                            <input id="title" name="title" value={bookData.title} onChange={handleChange} required />
                        </label>
                    </div>

                    <div className="form-group">
                        <label htmlFor="author">
                            Автор
                            <input id="author" name="author" value={bookData.author} onChange={handleChange} required />
                        </label>
                    </div>

                    <div className="form-group">
                        <label htmlFor="genre">
                            Жанр
                            <input id="genre" name="genre" value={bookData.genre} onChange={handleChange} />
                        </label>
                    </div>

                    <div className="form-group">
                        <label htmlFor="publisher">
                            Видавництво
                            <input id="publisher" name="publisher" value={bookData.publisher} onChange={handleChange} />
                        </label>
                    </div>

                    <div className="form-group">
                        <label htmlFor="language">
                            Мова
                            <select id="language" name="language" value={bookData.language} onChange={handleChange}>
                                <option value="">Оберіть мову</option>
                                <option value="Українська">Українська</option>
                                <option value="Англійська">Англійська</option>
                            </select>
                        </label>
                    </div>

                    <div className="form-group">
                        <label htmlFor="price">
                            Ціна (грн)
                            <input id="price" type="number" name="price" value={bookData.price} onChange={handleChange} required />
                        </label>
                    </div>

                    <div className="form-group">
                        <label htmlFor="image">
                            URL зображення
                            <input id="image" name="image" value={bookData.image} onChange={handleChange} />
                        </label>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">
                            Опис книги
                            <textarea
                                id="description"
                                name="description"
                                value={bookData.description}
                                onChange={handleChange}
                                rows="5"
                                className="form-textarea"
                            />
                        </label>
                    </div>

                    <div className="form-group">
                        <label htmlFor="count">
                            Кількість книг у наявності
                            <input
                                id="count"
                                type="number"
                                name="count"
                                value={bookData.count}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </label>
                    </div>

                    <button type="submit" className="btn-primary btn-full">Зберегти книгу</button>
                </form>
            </div>
        </main>
    );
}

export default AddBookPage;
