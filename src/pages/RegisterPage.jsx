import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import showNotification from '../utils/notifications';

function RegisterPage({ onLogin }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            showNotification('Паролі не збігаються!', 'error');
            return;
        }

        try {
            const response = await api.post('/register', {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email.trim(),
                password: formData.password,
            });

            if (response.status === 201) {
                const userData = { ...response.data, isLoggedIn: true };
                localStorage.setItem('user', JSON.stringify(userData));

                if (onLogin) onLogin();

                showNotification('Реєстрація успішна! Ласкаво просимо.', 'success');
                navigate('/');
            }
        } catch {
            showNotification('Помилка реєстрації. Перевірте дані.', 'error');
        }
    };

    return (
        <main className="container">
            <div className="auth-card">
                <h2>Реєстрація</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="first_name">
                            Ім&apos;я
                            <input
                                type="text"
                                id="first_name"
                                required
                                value={formData.first_name}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    first_name: e.target.value,
                                })}
                            />
                        </label>
                    </div>
                    <div className="form-group">
                        <label htmlFor="last_name">
                            Прізвище
                            <input
                                type="text"
                                id="last_name"
                                required
                                value={formData.last_name}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    last_name: e.target.value,
                                })}
                            />
                        </label>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">
                            Email
                            <input
                                type="email"
                                id="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })}
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
                                value={formData.password}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    password: e.target.value,
                                })}
                            />
                        </label>
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">
                            Підтвердіть пароль
                            <input
                                type="password"
                                id="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    confirmPassword: e.target.value,
                                })}
                            />
                        </label>
                    </div>
                    <button type="submit" className="btn-primary btn-full">
                        Зареєструватися
                    </button>
                </form>
                <div className="auth-hint">
                    <span>Вже маєте акаунт?</span>
                    {' '}
                    <Link to="/login" className="auth-hint-link">Увійти</Link>
                </div>
            </div>
        </main>
    );
}

RegisterPage.propTypes = {
    onLogin: PropTypes.func.isRequired,
};

export default RegisterPage;
