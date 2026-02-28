import React from 'react';
import {
    render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EditUserPage from './EditUserPage';
import api from '../services/api';
import showNotification from '../utils/notifications';

jest.mock('../services/api.js');
jest.mock('../utils/notifications.js');

const mockUser = {
    id: '123',
    first_name: 'Олексій',
    last_name: 'Тестовий',
    role: 'user',
};

describe('EditUserPage Full Coverage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderComponent = (userId = '123') => render(
        <MemoryRouter initialEntries={[`/edit-user/${userId}`]}>
            <Routes>
                <Route path="/edit-user/:id" element={<EditUserPage />} />
            </Routes>
        </MemoryRouter>,
    );

    test('успішно завантажує та відображає дані користувача', async () => {
        api.get.mockResolvedValue({ data: mockUser });

        renderComponent();

        expect(screen.getByText(/Завантаження.../i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Олексій Тестовий')).toBeInTheDocument();
            expect(screen.getByDisplayValue(/Клієнт/i)).toBeInTheDocument();
        });
    });

    test('показує помилку, якщо не вдалося завантажити дані', async () => {
        api.get.mockRejectedValue(new Error('Fetch error'));

        renderComponent();

        await waitFor(() => {
            expect(showNotification).toHaveBeenCalledWith('Не вдалося завантажити дані', 'error');
        });
    });

    test('успішно оновлює роль користувача', async () => {
        api.get.mockResolvedValue({ data: mockUser });
        api.patch.mockResolvedValue({});

        renderComponent();

        const select = await screen.findByLabelText(/Тип користувача/i);
        fireEvent.change(select, { target: { value: 'admin' } });

        const saveBtn = screen.getByRole('button', { name: /Зберегти зміни/i });
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(api.patch).toHaveBeenCalledWith('/users/123', { role: 'admin' });
            expect(showNotification).toHaveBeenCalledWith('Роль успішно оновлено!', 'success');
        });
    });

    test('показує помилку при невдалому оновленні ролі', async () => {
        api.get.mockResolvedValue({ data: mockUser });
        api.patch.mockRejectedValue(new Error('Update failed'));

        renderComponent();

        const saveBtn = await screen.findByRole('button', { name: /Зберегти зміни/i });
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(showNotification).toHaveBeenCalledWith('Помилка оновлення ролі', 'error');
        });
    });

    test('логіка видалення: підтвердження та успішне видалення', async () => {
        api.get.mockResolvedValue({ data: mockUser });
        api.delete.mockResolvedValue({});

        renderComponent();

        const deleteBtn = await screen.findByRole('button', { name: /Видалити користувача/i });

        fireEvent.click(deleteBtn);
        const confirmBtn = screen.getByRole('button', { name: /Підтвердити видалення/i });
        expect(confirmBtn).toBeInTheDocument();

        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(api.delete).toHaveBeenCalledWith('/users/123');
            expect(showNotification).toHaveBeenCalledWith('Користувача видалено', 'info');
        });
    });

    test('показує помилку при невдалому видаленні', async () => {
        api.get.mockResolvedValue({ data: mockUser });
        api.delete.mockRejectedValue(new Error('Delete failed'));

        renderComponent();

        fireEvent.click(await screen.findByRole('button', { name: /Видалити користувача/i }));
        fireEvent.click(screen.getByRole('button', { name: /Підтвердити видалення/i }));

        await waitFor(() => {
            expect(showNotification).toHaveBeenCalledWith('Не вдалося видалити користувача', 'error');
        });
    });
});
