import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import userService from '../services/userService';
import showNotification from '../utils/notifications';

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await userService.getAllUsers();
            setUsers(Array.isArray(data) ? data : data.users || []);
        } catch {
            showNotification('Не вдалося завантажити список користувачів', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    return (
        <main className="container">
            <div className="user-list-header">
                <h1>Список користувачів</h1>
                <Link to="/register" className="btn-primary">Додати користувача</Link>
            </div>

            <div className="user-list">
                {users.map((user) => (
                    <article
                        key={user.id}
                        className={`user-card ${user.role === 'admin' ? 'admin-border' : 'regular-border'}`}
                    >
                        <h3>
                            {user.first_name}
                            {' '}
                            {user.last_name}
                        </h3>
                        <p>
                            <strong>Email:</strong>
                            {' '}
                            {user.email}
                        </p>
                        <p>
                            <strong>Роль:</strong>
                            {' '}
                            <span className={user.role === 'admin' ? 'role-admin' : 'role-regular'}>
                                {user.role}
                            </span>
                        </p>
                        <Link to={`/edit-user/${user.id}`} className="btn-primary">
                            Редагувати
                        </Link>
                    </article>
                ))}
            </div>

            {loading && <p style={{ textAlign: 'center' }}>Завантаження користувачів...</p>}

            {!loading && users.length === 0 && (
                <p style={{ textAlign: 'center' }}>Користувачів не знайдено.</p>
            )}
        </main>
    );
}

export default UsersPage;
