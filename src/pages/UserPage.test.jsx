import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UsersPage from './UsersPage';
import userService from '../services/userService';
import showNotification from '../utils/notifications';

jest.mock('../services/userService.js');
jest.mock('../utils/notifications.js');

const mockUsers = [
    {
        id: 1,
        first_name: 'Олександр',
        last_name: 'Адмін',
        email: 'admin@test.com',
        role: 'admin',
    },
    {
        id: 2,
        first_name: 'Марія',
        last_name: 'Користувач',
        email: 'user@test.com',
        role: 'regular',
    },
];

describe('UsersPage 100% Coverage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('відображає стан завантаження, а потім список користувачів', async () => {
        userService.getAllUsers.mockResolvedValueOnce(mockUsers);

        render(
            <MemoryRouter>
                <UsersPage />
            </MemoryRouter>,
        );

        expect(screen.getByText(/Завантаження користувачів.../i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(/Олександр Адмін/i)).toBeInTheDocument();
            expect(screen.getByText(/Марія Користувач/i)).toBeInTheDocument();

            expect(screen.getByText('admin')).toBeInTheDocument();
            expect(screen.getByText('regular')).toBeInTheDocument();
        });

        expect(screen.queryByText(/Завантаження користувачів.../i)).not.toBeInTheDocument();
    });

    test('обробка помилки при завантаженні (блок catch)', async () => {
        userService.getAllUsers.mockRejectedValueOnce(new Error('Fetch error'));

        render(
            <MemoryRouter>
                <UsersPage />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(showNotification).toHaveBeenCalledWith(
                'Не вдалося завантажити список користувачів',
                'error',
            );
            expect(screen.getByText(/Користувачів не знайдено/i)).toBeInTheDocument();
        });
    });

    test('відображає повідомлення, якщо список порожній', async () => {
        userService.getAllUsers.mockResolvedValueOnce([]);

        render(
            <MemoryRouter>
                <UsersPage />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(screen.getByText(/Користувачів не знайдено/i)).toBeInTheDocument();
        });
    });

    test('покриття альтернативної структури даних (data.users)', async () => {
        userService.getAllUsers.mockResolvedValueOnce({ users: [mockUsers[0]] });

        render(
            <MemoryRouter>
                <UsersPage />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(screen.getByText(/Олександр Адмін/i)).toBeInTheDocument();
        });
    });

    test('перевірка посилань на реєстрацію та редагування', async () => {
        userService.getAllUsers.mockResolvedValueOnce([mockUsers[0]]);

        render(
            <MemoryRouter>
                <UsersPage />
            </MemoryRouter>,
        );

        expect(screen.getByRole('link', { name: /Додати користувача/i })).toHaveAttribute('href', '/register');

        await waitFor(() => {
            expect(screen.getByRole('link', { name: /Редагувати/i })).toHaveAttribute('href', '/edit-user/1');
        });
    });
});
