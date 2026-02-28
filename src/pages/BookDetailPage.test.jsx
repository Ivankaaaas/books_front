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
        id: 2,
        title: 'Схожа книга',
        author: 'Автор',
        price: 200,
        image_url: 's.jpg',
    },
];

const mockReviews = [
    {
        id: 1,
        user_name: 'Іван',
        rating: 5,
        text: 'Чудова книга!',
        created_at: new Date().toISOString(),
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
        expect(screen.getByText(/Завантаження/i)).toBeInTheDocument();
    });

    test('відображає книгу, схожі товари та відгуки', async () => {
        authService.getCurrentUser.mockReturnValue({ id: 123 });

        bookService.getBookById.mockResolvedValue(mockBook);
        bookService.getSimilarBooks.mockResolvedValue(mockSimilar);
        bookService.getBookReviews.mockResolvedValue(mockReviews);

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText(mockBook.title)).toBeInTheDocument();
            expect(screen.getByText(mockReviews[0].text)).toBeInTheDocument();
            expect(screen.getByText(/Схожа книга/i)).toBeInTheDocument();
        });
    });

    test('показує "Книгу не знайдено"', async () => {
        bookService.getBookById.mockResolvedValue(null);
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText(/Книгу не знайдено/i)).toBeInTheDocument();
        });
    });

    test('помилка при завантаженні даних', async () => {
        bookService.getBookById.mockRejectedValue(new Error('Fail'));
        renderComponent();

        await waitFor(() => {
            expect(showNotification)
                .toHaveBeenCalledWith('Не вдалося завантажити дані', 'error');
        });
    });

    test('успішне додавання в кошик', async () => {
        authService.getCurrentUser.mockReturnValue({ id: 123 });
        bookService.getBookById.mockResolvedValue(mockBook);
        bookService.getSimilarBooks.mockResolvedValue([]);
        bookService.getBookReviews.mockResolvedValue([]);
        cartService.addToCart.mockResolvedValue({});

        renderComponent();

        const btn = await screen.findByRole('button', { name: /Додати в кошик/i });
        fireEvent.click(btn);

        await waitFor(() => {
            expect(cartService.addToCart)
                .toHaveBeenCalledWith(mockBook.id, 123);
        });
    });

    test('не дає додати в кошик якщо не залогінений', async () => {
        authService.getCurrentUser.mockReturnValue(null);
        bookService.getBookById.mockResolvedValue(mockBook);
        bookService.getSimilarBooks.mockResolvedValue([]);
        bookService.getBookReviews.mockResolvedValue([]);

        renderComponent();

        const btn = await screen.findByRole('button', { name: /Додати в кошик/i });
        fireEvent.click(btn);

        expect(showNotification)
            .toHaveBeenCalledWith(expect.stringContaining('увійдіть'), 'info');
    });

    test('успішне додавання відгуку', async () => {
        authService.getCurrentUser.mockReturnValue({ id: 123 });

        bookService.getBookById.mockResolvedValue(mockBook);
        bookService.getSimilarBooks.mockResolvedValue([]);
        bookService.getBookReviews
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([]);

        bookService.addReview.mockResolvedValue({});

        renderComponent();

        await screen.findByText(mockBook.title);

        const stars = screen.getAllByRole('button', { type: 'button' });
        fireEvent.click(stars[1]);

        const submitBtn = screen.getByRole('button', { name: /Надіслати/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(bookService.addReview).toHaveBeenCalled();
            expect(showNotification)
                .toHaveBeenCalledWith('Відгук додано!', 'success');
        });
    });

    test('помилка якщо не поставлена оцінка', async () => {
        authService.getCurrentUser.mockReturnValue({ id: 123 });

        bookService.getBookById.mockResolvedValue(mockBook);
        bookService.getSimilarBooks.mockResolvedValue([]);
        bookService.getBookReviews.mockResolvedValue([]);

        renderComponent();

        const submitBtn = await screen.findByRole('button', { name: /Надіслати/i });
        fireEvent.click(submitBtn);

        expect(showNotification)
            .toHaveBeenCalledWith('Будь ласка, поставте оцінку', 'info');
    });

    test('помилка при додаванні відгуку (catch)', async () => {
        authService.getCurrentUser.mockReturnValue({ id: 123 });

        bookService.getBookById.mockResolvedValue(mockBook);
        bookService.getSimilarBooks.mockResolvedValue([]);
        bookService.getBookReviews.mockResolvedValue([]);
        bookService.addReview.mockRejectedValue(new Error('Fail'));

        renderComponent();

        await screen.findByText(mockBook.title);

        const stars = screen.getAllByRole('button', { type: 'button' });
        fireEvent.click(stars[1]);

        const submitBtn = screen.getByRole('button', { name: /Надіслати/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(showNotification)
                .toHaveBeenCalledWith('Помилка при додаванні відгуку', 'error');
        });
    });
});
