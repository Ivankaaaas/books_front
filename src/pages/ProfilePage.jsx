import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import api from '../services/api';
import showNotification from '../utils/notifications';

function ProfilePage() {
    const user = authService.getCurrentUser();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
    });
    const [isEditing, setIsEditing] = useState({ first_name: false, last_name: false });
    const [showSave, setShowSave] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
            });
        }
        // Використовуємо опціональний ланцюжок, щоб не зациклювати на об'єкті
    }, [user?.id, user?.email]);

    const toggleEdit = (field) => {
        setIsEditing((prev) => ({ ...prev, [field]: true }));
        setShowSave(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const response = await api.patch(`/users/${user.id}`, {
                first_name: formData.first_name,
                last_name: formData.last_name,
            });

            const updatedUser = { ...user, ...response.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            showNotification('Дані успішно оновлено!', 'success');
            setIsEditing({ first_name: false, last_name: false });
            setShowSave(false);

            // Замість перезавантаження просто онови сторінку, якщо App не підхопив зміни
            window.location.reload();
        } catch {
            showNotification('Помилка при збереженні даних', 'error');
        }
    };

    const handleLogout = () => {
        authService.logout();
    };

    return (
        <main className="container">
            <div
                className="auth-card profile-card"
                style={{
                    maxWidth: '400px',
                    margin: '40px auto',
                    padding: '30px',
                }}
            >
                <h2 style={{ marginBottom: '25px', color: '#2c3e50' }}>Мій профіль</h2>

                <form onSubmit={handleSave}>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label htmlFor="profile-first-name">
                            Ім&apos;я
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    id="profile-first-name"
                                    value={formData.first_name}
                                    readOnly={!isEditing.first_name}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        first_name: e.target.value,
                                    })}
                                    style={{
                                        backgroundColor: isEditing.first_name ? '#fff' : '#f9f9f9',
                                    }}
                                />
                                {!isEditing.first_name && (
                                    <span
                                        className="edit-icon"
                                        onClick={() => toggleEdit('first_name')}
                                        role="button"
                                        aria-label="Редагувати ім'я"
                                        tabIndex={0}
                                        onKeyPress={(e) => e.key === 'Enter' && toggleEdit('first_name')}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            cursor: 'pointer',
                                            opacity: 0.6,
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                        </label>
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label htmlFor="profile-last-name">
                            Прізвище
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    id="profile-last-name"
                                    value={formData.last_name}
                                    readOnly={!isEditing.last_name}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        last_name: e.target.value,
                                    })}
                                    style={{
                                        backgroundColor: isEditing.last_name ? '#fff' : '#f9f9f9',
                                    }}
                                />
                                {!isEditing.last_name && (
                                    <span
                                        className="edit-icon"
                                        onClick={() => toggleEdit('last_name')}
                                        role="button"
                                        aria-label="Редагувати прізвище"
                                        tabIndex={0}
                                        onKeyPress={(e) => e.key === 'Enter' && toggleEdit('last_name')}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            cursor: 'pointer',
                                            opacity: 0.6,
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                        </label>
                    </div>

                    <div className="form-group" style={{ marginBottom: '25px' }}>
                        <label htmlFor="profile-email">
                            Email (не змінюється)
                            <input
                                id="profile-email"
                                type="email"
                                value={formData.email}
                                readOnly
                                style={{
                                    backgroundColor: '#f9f9f9',
                                    color: '#888',
                                    cursor: 'not-allowed',
                                }}
                            />
                        </label>
                    </div>

                    {showSave && (
                        <button
                            type="submit"
                            className="btn-primary btn-full"
                            style={{ marginBottom: '10px' }}
                        >
                            Зберегти зміни
                        </button>
                    )}
                </form>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="btn-delete btn-full"
                >
                    Вийти
                </button>
            </div>
        </main>
    );
}

export default ProfilePage;
