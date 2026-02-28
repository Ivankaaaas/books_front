import React from 'react';
import {
    render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import AddBookPage from './AddBookPage';
import bookService from '../services/bookService';
import showNotification from '../utils/notifications';

jest.mock('../services/bookService.js');
jest.mock('../utils/notifications.js');
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

describe('AddBookPage Perfect 100% Coverage', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
    });

    test('renders all form fields and handles input changes (text & checkbox)', async () => {
        render(
            <MemoryRouter>
                <AddBookPage />
            </MemoryRouter>,
        );

        expect(screen.getByText(/Додати нову книгу/i)).toBeInTheDocument();

        const authorInput = screen.getByLabelText(/Автор/i);
        fireEvent.change(authorInput, { target: { name: 'author', value: 'Шевченко' } });
        expect(authorInput.value).toBe('Шевченко');

        fireEvent.change(authorInput, {
            target: { name: 'test_check', type: 'checkbox', checked: true },
        });

        const langSelect = screen.getByLabelText(/Мова/i);
        fireEvent.change(langSelect, { target: { name: 'language', value: 'Українська' } });
        expect(langSelect.value).toBe('Українська');
    });

    test('successfully submits the form and navigates to home', async () => {
        bookService.createBook.mockResolvedValueOnce({ success: true });

        render(
            <MemoryRouter>
                <AddBookPage />
            </MemoryRouter>,
        );

        fireEvent.change(screen.getByLabelText(/Назва книги/i), { target: { name: 'title', value: 'Test' } });
        fireEvent.change(screen.getByLabelText(/Автор/i), { target: { name: 'author', value: 'Test' } });
        fireEvent.change(screen.getByLabelText(/Ціна \(грн\)/i), { target: { name: 'price', value: '100' } });
        fireEvent.change(screen.getByLabelText(/Кількість книг/i), { target: { name: 'count', value: '5' } });

        const submitBtn = screen.getByRole('button', { name: /Зберегти книгу/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(bookService.createBook).toHaveBeenCalled();
            expect(showNotification).toHaveBeenCalledWith('Книгу успішно додано!', 'success');
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    test('handles failed form submission (Line 38 coverage)', async () => {
        bookService.createBook.mockRejectedValueOnce(new Error('Fail'));

        render(
            <MemoryRouter>
                <AddBookPage />
            </MemoryRouter>,
        );

        const submitBtn = screen.getByRole('button', { name: /Зберегти книгу/i });
        fireEvent.submit(submitBtn);

        await waitFor(() => {
            expect(showNotification).toHaveBeenCalledWith('Помилка при додаванні книги', 'error');
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });
});
