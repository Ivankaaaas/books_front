import React from 'react';
import {
    render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';
import bookService from '../services/bookService';
import showNotification from '../utils/notifications';

jest.mock('../services/bookService.js');
jest.mock('../utils/notifications.js');

const mockBooks = [
    {
        id: 1, title: 'Алхімік', author: 'Коельйо', price: 150, image_url: '1.jpg',
    },
    {
        id: 2, title: '1984', author: 'Орвелл', price: 300, image_url: '2.jpg',
    },
    {
        id: 3, title: 'Айвенго', author: 'Скотт', price: 100, image_url: '3.jpg',
    },
];

describe('HomePage Full Coverage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('відображає стан завантаження, а потім список книг', async () => {
        bookService.getAllBooks.mockResolvedValue(mockBooks);

        render(
            <MemoryRouter>
                <HomePage searchQuery="" />
            </MemoryRouter>,
        );

        expect(screen.getByText(/Завантаження.../i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Алхімік')).toBeInTheDocument();
            expect(screen.getByText('1984')).toBeInTheDocument();
        });
    });

    test('показує повідомлення про помилку, якщо API не працює', async () => {
        bookService.getAllBooks.mockRejectedValue(new Error('API fail'));

        render(
            <MemoryRouter>
                <HomePage searchQuery="" />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(showNotification).toHaveBeenCalledWith(
                'Не вдалося завантажити каталог книг',
                'error',
            );
        });
    });

    test('правильно фільтрує книги за назвою або автором', async () => {
        bookService.getAllBooks.mockResolvedValue(mockBooks);

        const { rerender } = render(
            <MemoryRouter>
                <HomePage searchQuery="Орвелл" />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(screen.getByText('1984')).toBeInTheDocument();
            expect(screen.queryByText('Алхімік')).not.toBeInTheDocument();
        });

        rerender(
            <MemoryRouter>
                <HomePage searchQuery="Айв" />
            </MemoryRouter>,
        );
        expect(screen.getByText('Айвенго')).toBeInTheDocument();
    });

    test('правильно сортує книги за ціною (asc/desc)', async () => {
        bookService.getAllBooks.mockResolvedValue(mockBooks);

        render(
            <MemoryRouter>
                <HomePage searchQuery="" />
            </MemoryRouter>,
        );

        await screen.findByText('Алхімік');
        const select = screen.getByRole('combobox');

        fireEvent.change(select, { target: { value: 'asc' } });
        let bookTitles = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
        expect(bookTitles[0]).toBe('Айвенго');

        fireEvent.change(select, { target: { value: 'desc' } });
        bookTitles = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
        expect(bookTitles[0]).toBe('1984');

        fireEvent.change(select, { target: { value: 'none' } });
    });
});
