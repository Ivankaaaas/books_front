import React, { useState } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';
import EditUserPage from './pages/EditUserPage';
import BookDetailPage from './pages/BookDetailPage';
import CartPage from './pages/CartPage';
import AddBookPage from './pages/AddBookPage';
import Header from './components/Header';
import authService from './services/authService';
import './styles/main.scss';

function App() {
    const [user, setUser] = useState(authService.getCurrentUser());
    const [searchQuery, setSearchQuery] = useState('');

    const refreshUser = () => {
        setUser(authService.getCurrentUser());
    };

    const isAdmin = user && user.role === 'admin';
    const isAuthenticated = !!user;

    return (
        <Router>
            <div className="page-body">
                <Header
                    key={isAuthenticated ? user.id : 'guest'}
                    onSearch={setSearchQuery}
                />

                <Routes>
                    <Route path="/" element={<HomePage searchQuery={searchQuery} />} />

                    <Route
                        path="/login"
                        element={isAuthenticated
                            ? <Navigate to="/profile" replace />
                            : <LoginPage onLogin={refreshUser} />}
                    />
                    <Route
                        path="/register"
                        element={(isAuthenticated && !isAdmin)
                            ? <Navigate to="/" replace />
                            : <RegisterPage onLogin={refreshUser} />}
                    />
                    <Route
                        path="/profile"
                        element={isAuthenticated
                            ? <ProfilePage />
                            : <Navigate to="/login" replace />}
                    />
                    <Route
                        path="/users"
                        element={isAdmin
                            ? <UsersPage />
                            : <Navigate to="/" replace />}
                    />
                    <Route
                        path="/edit-user/:id"
                        element={isAdmin
                            ? <EditUserPage />
                            : <Navigate to="/" replace />}
                    />
                    <Route
                        path="/add-book"
                        element={isAdmin
                            ? <AddBookPage />
                            : <Navigate to="/" replace />}
                    />

                    <Route path="/book/:id" element={<BookDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                <footer className="main-footer">
                    <p>
                        &copy; 2026 Книгарня
                    </p>
                </footer>
            </div>
        </Router>
    );
}

export default App;
