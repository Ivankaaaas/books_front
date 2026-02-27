import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import showNotification from '../utils/notifications';

function LoginPage({ onLogin }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post('/login_json', {
                email: email.trim(),
                password,
            });

            if (response.data) {
                const userData = { ...response.data, isLoggedIn: true };
                localStorage.setItem('user', JSON.stringify(userData));

                if (onLogin) onLogin();

                showNotification('Вхід успішний! З поверненням.', 'success');
                navigate('/');
            }
        } catch {
            showNotification('Невірний email або пароль', 'error');
        }
    };

    return (
        <main className="container">
            <div className="auth-card">
                <h2>Вхід до системи</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">
                            Email
                            <input
                                type="email"
                                id="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@mail.com"
                            />
                        </label>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">
                            Пароль
                            <input
                                type="password"
                                id="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Ваш пароль"
                            />
                        </label>
                    </div>
                    <button type="submit" className="btn-primary btn-full">
                        Увійти
                    </button>
                </form>

                <div className="auth-hint">
                    <span>Ще не маєте акаунту?</span>
                    {' '}
                    <Link to="/register" className="auth-hint-link">Зареєструватися</Link>
                </div>
            </div>
        </main>
    );
}

LoginPage.propTypes = {
    onLogin: PropTypes.func.isRequired,
};

export default LoginPage;
