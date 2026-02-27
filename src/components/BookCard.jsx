import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import cartService from '../services/cartService';
import authService from '../services/authService';
import showNotification from '../utils/notifications';

function BookCard({ book }) {
    const user = authService.getCurrentUser();

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            showNotification('Будь ласка, увійдіть, щоб купувати книги', 'info');
            return;
        }

        try {
            await cartService.addToCart(book.id, user.id);
            showNotification('Книгу додано до кошика!', 'success');
        } catch {
            showNotification('Помилка при додаванні', 'error');
        }
    };

    return (
        <div className="book-card">
            <Link to={`/book/${book.id}`} className="book-card-link">
                <img src={book.image_url} alt={book.title} className="book-img" />
                <div className="book-card-info">
                    <h2>{book.title}</h2>
                    <p className="author">{book.author}</p>
                    <p className="price">
                        {book.price}
                        {' '}
                        грн
                    </p>
                </div>
            </Link>

            <button
                type="button"
                className="btn-primary"
                onClick={handleAddToCart}
            >
                У кошик
            </button>
        </div>
    );
}

BookCard.propTypes = {
    book: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        author: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        image_url: PropTypes.string.isRequired,
    }).isRequired,
};

export default BookCard;
