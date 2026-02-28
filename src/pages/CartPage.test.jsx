import React from 'react';
import {
    render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CartPage from './CartPage';
import cartService from '../services/cartService';
import authService from '../services/authService';
import showNotification from '../utils/notifications';

jest.mock('../services/cartService.js');
jest.mock('../services/authService.js');
jest.mock('../utils/notifications.js');

const mockCartItems = [
    {
        id: 10,
        quantity: 2,
        book: {
            id: 1, title: 'Тестова книга', author: 'Автор', price: 100, image_url: 'img.jpg',
        },
    },
];

describe('CartPage Full Coverage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('відображає стан завантаження', () => {
        authService.getCurrentUser.mockReturnValue({ id: 1 });
        cartService.getCart.mockReturnValue(new Promise(() => {}));
        render(<MemoryRouter><CartPage /></MemoryRouter>);
        expect(screen.getByText(/Завантаження кошика/i)).toBeInTheDocument();
    });

    test('відображає повідомлення про порожній кошик, якщо товарів немає', async () => {
        authService.getCurrentUser.mockReturnValue({ id: 1 });
        cartService.getCart.mockResolvedValue([]);

        render(<MemoryRouter><CartPage /></MemoryRouter>);

        await waitFor(() => {
            expect(screen.getByText(/Ваш кошик наразі порожній/i)).toBeInTheDocument();
        });
    });

    test('відображає товари та правильно рахує загальну суму', async () => {
        authService.getCurrentUser.mockReturnValue({ id: 1 });
        cartService.getCart.mockResolvedValue(mockCartItems);

        render(<MemoryRouter><CartPage /></MemoryRouter>);

        await waitFor(() => {
            expect(screen.getByText('Тестова книга')).toBeInTheDocument();
            const priceElements = screen.getAllByText(/200/);
            expect(priceElements.length).toBeGreaterThan(1);
        });
    });

    test('зміна кількості товару (handleQuantity) - успіх (Рядки 14-15)', async () => {
        authService.getCurrentUser.mockReturnValue({ id: 1 });
        cartService.getCart.mockResolvedValue(mockCartItems);
        cartService.updateQuantity.mockResolvedValue({});

        render(<MemoryRouter><CartPage /></MemoryRouter>);

        const plusBtn = await screen.findByLabelText(/Збільшити кількість/i);
        fireEvent.click(plusBtn);

        await waitFor(() => {
            expect(cartService.updateQuantity).toHaveBeenCalledWith(10, 'increase');
            expect(cartService.getCart).toHaveBeenCalledTimes(2);
        });
    });

    test('зміна кількості товару (handleQuantity) - помилка', async () => {
        authService.getCurrentUser.mockReturnValue({ id: 1 });
        cartService.getCart.mockResolvedValue(mockCartItems);
        cartService.updateQuantity.mockRejectedValue({
            response: { data: { detail: 'Недостатньо на складі' } },
        });

        render(<MemoryRouter><CartPage /></MemoryRouter>);

        const minusBtn = await screen.findByLabelText(/Зменшити кількість/i);
        fireEvent.click(minusBtn);

        await waitFor(() => {
            expect(showNotification).toHaveBeenCalledWith('Недостатньо на складі', 'error');
        });
    });

    test('видалення товару (handleRemove) (Рядок 47)', async () => {
        authService.getCurrentUser.mockReturnValue({ id: 1 });
        cartService.getCart.mockResolvedValue(mockCartItems);
        cartService.removeFromCart.mockResolvedValue({});

        render(<MemoryRouter><CartPage /></MemoryRouter>);

        const deleteBtn = await screen.findByLabelText(/Видалити товар/i);
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(cartService.removeFromCart).toHaveBeenCalledWith(10);
            expect(showNotification).toHaveBeenCalledWith(expect.stringContaining('видалено'), 'info');
        });
    });

    test('оформлення замовлення показує повідомлення', async () => {
        authService.getCurrentUser.mockReturnValue({ id: 1 });
        cartService.getCart.mockResolvedValue(mockCartItems);

        render(<MemoryRouter><CartPage /></MemoryRouter>);

        const checkoutBtn = await screen.findByText(/Оформити замовлення/i);
        fireEvent.click(checkoutBtn);

        expect(showNotification).toHaveBeenCalledWith(expect.stringContaining('прийнято'), 'success');
    });

    test('показує помилку при завантаженні (loadCart catch)', async () => {
        authService.getCurrentUser.mockReturnValue({ id: 1 });
        cartService.getCart.mockRejectedValue(new Error('Fail'));

        render(<MemoryRouter><CartPage /></MemoryRouter>);

        await waitFor(() => {
            expect(showNotification).toHaveBeenCalledWith('Помилка завантаження кошика', 'error');
        });
    });
});
