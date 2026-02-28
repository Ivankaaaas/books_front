import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import authService from '../services/authService';

jest.mock('../services/authService');

describe('Header Component Full Coverage', () => {
    const mockOnSearch = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderHeader = (initialEntries = ['/']) => render(
        <MemoryRouter initialEntries={initialEntries}>
            <Header onSearch={mockOnSearch} />
        </MemoryRouter>,
    );

    test('відображає логотип та кошик за замовчуванням', () => {
        authService.getCurrentUser.mockReturnValue(null);
        renderHeader();

        expect(screen.getByText(/BookStore/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Кошик/i)).toBeInTheDocument();
    });

    test('якщо користувач не залогінений, посилання профілю веде на /login', () => {
        authService.getCurrentUser.mockReturnValue(null);
        renderHeader();

        const profileLink = screen.getByLabelText(/Профіль/i);
        expect(profileLink.closest('a')).toHaveAttribute('href', '/login');
    });

    test('якщо користувач залогінений, посилання профілю веде на /profile', () => {
        authService.getCurrentUser.mockReturnValue({ id: 1, role: 'user' });
        renderHeader();

        const profileLink = screen.getByLabelText(/Профіль/i);
        expect(profileLink.closest('a')).toHaveAttribute('href', '/profile');
    });

    test('якщо залогінений адмін, відображаються адмін-панелі (Користувачі, Додати книгу)', () => {
        authService.getCurrentUser.mockReturnValue({ id: 1, role: 'admin' });
        renderHeader();

        expect(screen.getByText(/Користувачі/i)).toBeInTheDocument();
        expect(screen.getByText(/Додати книгу/i)).toBeInTheDocument();
    });

    test('керування пошуком: відкриття бару, введення тексту та закриття', () => {
        authService.getCurrentUser.mockReturnValue(null);
        renderHeader();

        const searchBtn = screen.getByLabelText(/Пошук/i);

        fireEvent.click(searchBtn);
        const input = screen.getByPlaceholderText(/Назва або автор/i);
        expect(input).toBeInTheDocument();

        fireEvent.change(input, { target: { value: 'Тест' } });
        expect(mockOnSearch).toHaveBeenCalledWith('Тест');

        fireEvent.click(searchBtn);
        expect(screen.queryByPlaceholderText(/Назва або автор/i)).not.toBeInTheDocument();
    });

    test('useEffect: очищення пошуку при зміні маршруту (pathname)', () => {
        authService.getCurrentUser.mockReturnValue(null);

        const { rerender } = render(
            <MemoryRouter initialEntries={['/']}>
                <Header onSearch={mockOnSearch} />
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByLabelText(/Пошук/i));
        fireEvent.change(screen.getByPlaceholderText(/Назва або автор/i), { target: { value: 'Книга' } });

        rerender(
            <MemoryRouter initialEntries={['/cart']}>
                <Header onSearch={mockOnSearch} />
            </MemoryRouter>,
        );

        expect(mockOnSearch).toHaveBeenCalledWith('');
    });
});
