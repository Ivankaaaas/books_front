import React from 'react';
import {
    render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import api from '../services/api';
import showNotification from '../utils/notifications';

jest.mock('../services/api.js');
jest.mock('../utils/notifications.js');

describe('LoginPage Ultimate 100% Coverage', () => {
    const mockOnLogin = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('успішний вхід: перевірка trim(), localStorage та редирект', async () => {
        const mockUserData = { id: 1, email: 'admin@test.com', first_name: 'Admin' };
        api.post.mockResolvedValue({ data: mockUserData });

        render(
            <MemoryRouter>
                <LoginPage onLogin={mockOnLogin} />
            </MemoryRouter>,
        );

        const emailInput = screen.getByLabelText(/Email/i);
        const passInput = screen.getByLabelText(/Пароль/i);
        const submitBtn = screen.getByRole('button', { name: /Увійти/i });

        fireEvent.change(emailInput, {
            target: { value: '  admin@test.com  ' },
        });
        fireEvent.change(passInput, {
            target: { value: 'password123' },
        });

        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/login_json', {
                email: 'admin@test.com',
                password: 'password123',
            });

            expect(localStorage.getItem('user')).toContain('isLoggedIn');
            expect(mockOnLogin).toHaveBeenCalled();
            expect(showNotification).toHaveBeenCalledWith(
                expect.stringContaining('Вхід успішний'),
                'success',
            );
        });
    });

    test('обробка помилки входу (Рядок 31 - блок catch)', async () => {
        api.post.mockRejectedValueOnce(new Error('Unauthorized'));

        render(
            <MemoryRouter>
                <LoginPage onLogin={mockOnLogin} />
            </MemoryRouter>,
        );

        const submitBtn = screen.getByRole('button', { name: /Увійти/i });

        fireEvent.change(screen.getByLabelText(/Email/i), {
            target: { value: 'test@test.com' },
        });
        fireEvent.change(screen.getByLabelText(/Пароль/i), {
            target: { value: '123456' },
        });

        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(showNotification).toHaveBeenCalledWith(
                'Невірний email або пароль',
                'error',
            );
        }, { timeout: 2000 });
    });

    test('гілка if (!response.data): коли сервер відповів порожнечею', async () => {
        api.post.mockResolvedValue({ data: null });

        render(
            <MemoryRouter>
                <LoginPage onLogin={mockOnLogin} />
            </MemoryRouter>,
        );

        fireEvent.change(screen.getByLabelText(/Email/i), {
            target: { value: 'test@test.com' },
        });
        fireEvent.change(screen.getByLabelText(/Пароль/i), {
            target: { value: '123456' },
        });

        fireEvent.click(screen.getByRole('button', { name: /Увійти/i }));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalled();
            expect(mockOnLogin).not.toHaveBeenCalled();
        });
    });

    test('відображає посилання на реєстрацію', () => {
        render(
            <MemoryRouter>
                <LoginPage onLogin={mockOnLogin} />
            </MemoryRouter>,
        );
        expect(screen.getByText(/Зареєструватися/i)).toBeInTheDocument();
    });
});
