import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import showNotification from '../utils/notifications';

function EditUserPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [userName, setUserName] = useState('Завантаження...');
    const [role, setRole] = useState('user');
    const [loading, setLoading] = useState(true);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    const fetchUser = useCallback(async () => {
        try {
            const response = await api.get(`/users/${id}`);
            const userData = response.data;
            setUserName(`${userData.first_name} ${userData.last_name}`);
            setRole(userData.role);
        } catch {
            showNotification('Не вдалося завантажити дані', 'error');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/users/${id}`, { role });
            showNotification('Роль успішно оновлено!', 'success');
            navigate('/users');
        } catch {
            showNotification('Помилка оновлення ролі', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/users/${id}`);
            showNotification('Користувача видалено', 'info');
            navigate('/users');
        } catch {
            showNotification('Не вдалося видалити користувача', 'error');
        }
    };

    return (
        <main className="container">
            <Link to="/users" className="back-link" style={{ marginTop: '20px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Назад до списку
            </Link>

            <div className="auth-card">
                <h2>Редагувати роль</h2>
                <div style={{ marginBottom: '15px' }}>
                    Користувач:
                    {' '}
                    <strong id="user-name-display">{userName}</strong>
                </div>

                <form id="edit-user-form" onSubmit={handleSave}>
                    <div className="form-group">
                        <label htmlFor="user-role">
                            Тип користувача:
                            <select
                                id="user-role"
                                name="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                disabled={loading}
                            >
                                <option value="user">Клієнт</option>
                                <option value="admin">Адміністратор</option>
                            </select>
                        </label>
                    </div>

                    <div className="actions-group" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                            Зберегти зміни
                        </button>

                        {!isConfirmingDelete ? (
                            <button
                                type="button"
                                className="btn-delete"
                                onClick={() => setIsConfirmingDelete(true)}
                                style={{ flex: 1 }}
                            >
                                Видалити користувача
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn-delete"
                                onClick={handleDelete}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#c0392b',
                                    color: 'white',
                                    fontWeight: 'bold',
                                }}
                            >
                                Підтвердити видалення?
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </main>
    );
}

export default EditUserPage;
