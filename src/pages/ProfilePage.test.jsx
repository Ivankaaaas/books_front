import React from 'react';
import {
    render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from './ProfilePage';
import authService from '../services/authService';
import api from '../services/api';
import showNotification from '../utils/notifications';

jest.mock('../services/authService');
jest.mock('../services/api');
jest.mock('../utils/notifications');

describe('ProfilePage Stability Test', () => {
    const mockUser = {
        id: 1, first_name: 'Іван', last_name: 'Франко', email: 'ivan@test.com',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        authService.getCurrentUser.mockReturnValue(mockUser);
    });

    test('рендерить дані користувача', () => {
        render(<MemoryRouter><ProfilePage /></MemoryRouter>);
        expect(screen.getByDisplayValue('Іван')).toBeInTheDocument();
    });

    test('успішно зберігає зміни', async () => {
        api.patch.mockResolvedValueOnce({ data: { first_name: 'Тарас' } });
        render(<MemoryRouter><ProfilePage /></MemoryRouter>);

        fireEvent.click(screen.getByLabelText(/Редагувати ім'я/i));
        fireEvent.change(screen.getByLabelText(/Ім'я/i), { target: { value: 'Тарас' } });
        fireEvent.click(screen.getByText(/Зберегти зміни/i));

        await waitFor(() => {
            expect(api.patch).toHaveBeenCalled();
            expect(showNotification).toHaveBeenCalledWith('Дані успішно оновлено!', 'success');
        });
    });

    test('обробка помилки в catch', async () => {
        api.patch.mockRejectedValueOnce(new Error());
        render(<MemoryRouter><ProfilePage /></MemoryRouter>);

        fireEvent.click(screen.getByLabelText(/Редагувати ім'я/i));
        fireEvent.click(screen.getByText(/Зберегти зміни/i));

        await waitFor(() => {
            expect(showNotification).toHaveBeenCalledWith('Помилка при збереженні даних', 'error');
        });
    });

    test('logout викликає сервіс', () => {
        render(<MemoryRouter><ProfilePage /></MemoryRouter>);
        fireEvent.click(screen.getByText(/Вийти/i));
        expect(authService.logout).toHaveBeenCalled();
    });
});
