import React from 'react';
import {
    render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookCard from './BookCard';
import cartService from '../services/cartService';
import authService from '../services/authService';
import showNotification from '../utils/notifications';

jest.mock('../services/cartService');
jest.mock('../services/authService');
jest.mock('../utils/notifications');

const mockBook = {
    id: 1,
    title: 'Кобзар',
    author: 'Шевченко',
    price: 150,
    image_url: 'test-image.jpg',
};

describe('BookCard Full Coverage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders all book details correctly', () => {
        authService.getCurrentUser.mockReturnValue(null);
        render(<MemoryRouter><BookCard book={mockBook} /></MemoryRouter>);

        expect(screen.getByText(/Кобзар/i)).toBeInTheDocument();
        expect(screen.getByText(/Шевченко/i)).toBeInTheDocument();
        expect(screen.getByText(/150/)).toBeInTheDocument();
        expect(screen.getByAltText(/Кобзар/i)).toHaveAttribute('src', 'test-image.jpg');
    });

    test('shows info notification if user is not logged in', () => {
        authService.getCurrentUser.mockReturnValue(null);
        render(<MemoryRouter><BookCard book={mockBook} /></MemoryRouter>);

        const addToCartBtn = screen.getByRole('button', { name: /У кошик/i });
        fireEvent.click(addToCartBtn);

        expect(showNotification).toHaveBeenCalledWith(expect.stringContaining('увійдіть'), 'info');
    });

    test('calls cartService and shows success message on successful add', async () => {
        authService.getCurrentUser.mockReturnValue({ id: 123 });
        cartService.addToCart.mockResolvedValue({ success: true });

        render(<MemoryRouter><BookCard book={mockBook} /></MemoryRouter>);

        const addToCartBtn = screen.getByRole('button', { name: /У кошик/i });
        fireEvent.click(addToCartBtn);

        await waitFor(() => {
            expect(cartService.addToCart).toHaveBeenCalledWith(mockBook.id, 123);
            expect(showNotification).toHaveBeenCalledWith(expect.stringContaining('додано'), 'success');
        });
    });

    test('shows error message if cartService fails', async () => {
        authService.getCurrentUser.mockReturnValue({ id: 123 });
        cartService.addToCart.mockRejectedValue(new Error('Failed'));

        render(<MemoryRouter><BookCard book={mockBook} /></MemoryRouter>);

        const addToCartBtn = screen.getByRole('button', { name: /У кошик/i });
        fireEvent.click(addToCartBtn);

        await waitFor(() => {
            expect(showNotification).toHaveBeenCalledWith(expect.stringContaining('Помилка'), 'error');
        });
    });
});
