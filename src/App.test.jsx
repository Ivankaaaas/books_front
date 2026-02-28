import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./pages/HomePage', () => function () {
    return <div>Home Page</div>;
});
jest.mock('./components/Header', () => function () {
    return <header>Header</header>;
});

describe('App Component', () => {
    test('рендерить Header та головну сторінку', () => {
        render(<App />);
        expect(screen.getByText('Header')).toBeInTheDocument();
    });
});
