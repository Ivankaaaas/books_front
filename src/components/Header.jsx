import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import authService from '../services/authService';

function Header({ onSearch }) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [query, setQuery] = useState('');

    const location = useLocation();
    const user = authService.getCurrentUser();
    const isAdmin = user && user.role === 'admin';
    const profilePath = user ? '/profile' : '/login';

    useEffect(() => {
        setIsSearchOpen(false);
        setQuery('');
        if (onSearch) {
            onSearch('');
        }
    }, [location.pathname, onSearch]);

    const handleSearchChange = (e) => {
        const { value } = e.target;
        setQuery(value);
        if (onSearch) {
            onSearch(value);
        }
    };

    return (
        <header className="main-header">
            <div className="header-left">
                <Link to="/" className="logo-link nav-link">
                    <span className="logo-text">BookStore</span>
                </Link>
            </div>
            <nav className="header-right">
                <ul className="nav-list">
                    <li className="search-container">
                        {isSearchOpen && (
                            <input
                                type="text"
                                className="header-search-input"
                                placeholder="Назва або автор..."
                                value={query}
                                onChange={handleSearchChange}
                            />
                        )}
                        <button
                            type="button"
                            className="nav-link search-btn"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            aria-label="Пошук"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="4" fill="#888" />
                                <circle
                                    cx="11"
                                    cy="11"
                                    r="8"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                                <line
                                    x1="21"
                                    y1="21"
                                    x2="16.65"
                                    y2="16.65"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </button>
                    </li>

                    {isAdmin && (
                        <li>
                            <Link to="/users" className="nav-link">Користувачі</Link>
                        </li>
                    )}
                    {isAdmin && (
                        <li>
                            <Link to="/add-book" className="nav-link">Додати книгу</Link>
                        </li>
                    )}
                    <li>
                        <Link to="/cart" className="nav-link" aria-label="Кошик">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                        </Link>
                    </li>
                    <li>
                        <Link to={profilePath} className="nav-link" aria-label="Профіль">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
                            </svg>
                        </Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
}

Header.propTypes = {
    onSearch: PropTypes.func.isRequired,
};

export default Header;
