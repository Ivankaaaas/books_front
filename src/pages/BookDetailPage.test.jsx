import React from 'react';
import {
    render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BookDetailPage from './BookDetailPage';
import bookService from '../services/bookService';
import cartService from '../services/cartService';
import authService from '../services/authService';
import showNotification from '../utils/notifications';

jest.mock('../services/bookService.js');
jest.mock('../services/cartService.js');
jest.mock('../services/authService.js');
jest.mock('../utils/notifications.js');

const mockBook = {
    id: 1,
    title: 'Інферно',
    author: 'Ден Браун',
    price: 460,
    image_url: 'cover.jpg',
    description: 'Детектив',
    stock: 10,
    genre: 'Роман',
    publisher: 'КСД',
    language: 'Українська',
};

const mockSimilar = [
    {
        id: 2, title: 'Схожа книга', author: 'Автор', price: 200, image_url: 's.jpg',
    },
];

describe('BookDetailPage Full Coverage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderComponent = (bookId = '1') => render(
        <MemoryRouter initialEntries={[`/book/${bookId}`]}>
            <Routes>
                <Route path="/book/:id" element={<BookDetailPage />} />
            </Routes>
        </MemoryRouter>,
    );

    test('відображає стан завантаження', () => {
        bookService.getBookById.mockReturnValue(new Promise(() => {}));
        renderComponent();
        expect(screen.getByText(/Завантаження інформації/i)).toBeInTheDocument();
    });

    test('відображає дані книги та схожі товари', async () => {
        bookService.getBookById.mockResolvedValue(mockBook);
        bookService.getSimilarBooks.mockResolvedValue(mockSimilar);

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText(mockBook.title)).toBeInTheDocument();
            expect(screen.getByText(mockBook.description)).toBeInTheDocument();
            expect(screen.getByText(/Схожа книга/i)).toBeInTheDocument();
        });
    });

    test('відображає "Книгу не знайдено", якщо API повернуло null', async () => {
        bookService.getBookById.mockResolvedValue(null);
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText(/Книгу не знайдено/i)).toBeInTheDocument();
        });
    });

    test('показує помилку, якщо loadData впав (блок catch)', async () => {
        bookService.getBookById.mockRejectedValue(new Error('Fail'));
        renderComponent();

        await waitFor(() => {
            expect(showNotification).toHaveBeenCalledWith('Не вдалося завантажити дані', 'error');
        });
    });

    test('додавання в кошик: успішний сценарій', async () => {
        authService.getCurrentUser.mockReturnValue({ id: 123 });
        bookService.getBookById.mockResolvedValue(mockBook);
        bookService.getSimilarBooks.mockResolvedValue([]);
        cartService.addToCart.mockResolvedValue({});

        renderComponent();

        const btn = await screen.findByRole('button', { name: /Додати в кошик/i });
        fireEvent.click(btn);

        await waitFor(() => {
            expect(cartService.addToCart).toHaveBeenCalledWith(mockBook.id, 123);
            expect(showNotification).toHaveBeenCalledWith('Книгу додано до кошика!', 'success');
        });
    });

    test('додавання в кошик: помилка, якщо не залогінений', async () => {
        authService.getCurrentUser.mockReturnValue(null);
        bookService.getBookById.mockResolvedValue(mockBook);
        bookService.getSimilarBooks.mockResolvedValue([]);

        renderComponent();

        const btn = await screen.findByRole('button', { name: /Додати в кошик/i });
        fireEvent.click(btn);

        expect(showNotification).toHaveBeenCalledWith(expect.stringContaining('увійдіть'), 'info');
    });

    test('додавання в кошик: обробка помилки API (catch)', async () => {
        authService.getCurrentUser.mockReturnValue({ id: 123 });
        bookService.getBookById.mockResolvedValue(mockBook);
        cartService.addToCart.mockRejectedValue(new Error('Fail'));

        renderComponent();

        const btn = await screen.findByRole('button', { name: /Додати в кошик/i });
        fireEvent.click(btn);

        await waitFor(() => {
            expect(showNotification).toHaveBeenCalledWith('Не вдалося додати книгу', 'error');
        });
    });
});
