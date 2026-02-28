import React from 'react';
import {
    render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import api from '../services/api';
import showNotification from '../utils/notifications';

jest.mock('../services/api.js');
jest.mock('../utils/notifications.js');

describe('RegisterPage 100% Coverage', () => {
    const mockOnLogin = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('успішна реєстрація: статус 201, localStorage та перехід', async () => {
        const mockUserData = { id: 10, first_name: 'Ivan', email: 'ivan@test.com' };
        api.post.mockResolvedValueOnce({ status: 201, data: mockUserData });

        render(
            <MemoryRouter>
                <RegisterPage onLogin={mockOnLogin} />
            </MemoryRouter>,
        );

        fireEvent.change(screen.getByLabelText(/Ім'я/i), { target: { value: 'Ivan' } });
        fireEvent.change(screen.getByLabelText(/Прізвище/i), { target: { value: 'Tester' } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: ' ivan@test.com ' } });
        fireEvent.change(screen.getByLabelText(/^Пароль/i), { target: { value: 'pass123' } });
        fireEvent.change(screen.getByLabelText(/Підтвердіть пароль/i), { target: { value: 'pass123' } });

        fireEvent.click(screen.getByRole('button', { name: /Зареєструватися/i }));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/register', expect.objectContaining({
                email: 'ivan@test.com',
            }));

            const storedUser = JSON.parse(localStorage.getItem('user'));
            expect(storedUser.isLoggedIn).toBe(true);
            expect(mockOnLogin).toHaveBeenCalled();
            expect(showNotification).toHaveBeenCalledWith(expect.stringContaining('успішна'), 'success');
        });
    });

    test('помилка: паролі не збігаються', async () => {
        render(
            <MemoryRouter>
                <RegisterPage onLogin={mockOnLogin} />
            </MemoryRouter>,
        );

        fireEvent.change(screen.getByLabelText(/Ім'я/i), { target: { value: 'Ivan' } });
        fireEvent.change(screen.getByLabelText(/Прізвище/i), { target: { value: 'Tester' } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'ivan@test.com' } });
        fireEvent.change(screen.getByLabelText(/^Пароль/i), { target: { value: 'pass123' } });
        fireEvent.change(screen.getByLabelText(/Підтвердіть пароль/i), { target: { value: 'different' } });

        fireEvent.click(screen.getByRole('button', { name: /Зареєструватися/i }));

        expect(showNotification).toHaveBeenCalledWith('Паролі не збігаються!', 'error');
        expect(api.post).not.toHaveBeenCalled();
    });

    test('обробка помилки API (catch блок)', async () => {
        api.post.mockRejectedValueOnce(new Error('Server Error'));

        render(
            <MemoryRouter>
                <RegisterPage onLogin={mockOnLogin} />
            </MemoryRouter>,
        );

        fireEvent.change(screen.getByLabelText(/Ім'я/i), { target: { value: 'Ivan' } });
        fireEvent.change(screen.getByLabelText(/Прізвище/i), { target: { value: 'Tester' } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'ivan@test.com' } });
        fireEvent.change(screen.getByLabelText(/^Пароль/i), { target: { value: 'pass123' } });
        fireEvent.change(screen.getByLabelText(/Підтвердіть пароль/i), { target: { value: 'pass123' } });

        fireEvent.click(screen.getByRole('button', { name: /Зареєструватися/i }));

        await waitFor(() => {
            expect(showNotification).toHaveBeenCalledWith(
                'Помилка реєстрації. Перевірте дані.',
                'error',
            );
        });
    });

    test('гілка, коли статус не 201', async () => {
        api.post.mockResolvedValueOnce({ status: 200, data: {} });

        render(
            <MemoryRouter>
                <RegisterPage onLogin={mockOnLogin} />
            </MemoryRouter>,
        );

        fireEvent.change(screen.getByLabelText(/Ім'я/i), { target: { value: 'Ivan' } });
        fireEvent.change(screen.getByLabelText(/Прізвище/i), { target: { value: 'Tester' } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'ivan@test.com' } });
        fireEvent.change(screen.getByLabelText(/^Пароль/i), { target: { value: 'pass123' } });
        fireEvent.change(screen.getByLabelText(/Підтвердіть пароль/i), { target: { value: 'pass123' } });

        fireEvent.click(screen.getByRole('button', { name: /Зареєструватися/i }));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalled();
            expect(mockOnLogin).not.toHaveBeenCalled();
        });
    });

    test('відображає посилання на логін', () => {
        render(
            <MemoryRouter>
                <RegisterPage onLogin={mockOnLogin} />
            </MemoryRouter>,
        );
        expect(screen.getByText(/Вже маєте акаунт/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Увійти/i })).toHaveAttribute('href', '/login');
    });
});
