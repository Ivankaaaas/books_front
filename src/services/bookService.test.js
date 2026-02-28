import bookService from './bookService';
import api from './api';

jest.mock('./api');

describe('bookService Coverage 100%', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('getAllBooks має повертати список всіх книг', async () => {
        const mockBooks = [{ id: 1, title: 'Кобзар' }];
        api.get.mockResolvedValueOnce({ data: mockBooks });

        const result = await bookService.getAllBooks();

        expect(api.get).toHaveBeenCalledWith('/books');
        expect(result).toEqual(mockBooks);
    });

    test('getBookById має повертати одну книгу за ID', async () => {
        const mockBook = { id: 1, title: 'Кобзар' };
        api.get.mockResolvedValueOnce({ data: mockBook });

        const result = await bookService.getBookById(1);

        expect(api.get).toHaveBeenCalledWith('/books/1');
        expect(result).toEqual(mockBook);
    });

    test('getSimilarBooks має викликати правильний URL з параметром exclude_id', async () => {
        const mockSimilar = [{ id: 2, title: 'Захар Беркут' }];
        api.get.mockResolvedValueOnce({ data: mockSimilar });

        const result = await bookService.getSimilarBooks(1);

        expect(api.get).toHaveBeenCalledWith('/books/random/similar?exclude_id=1');
        expect(result).toEqual(mockSimilar);
    });

    describe('createBook', () => {
        test('має перетворювати ціну та кількість на числа та додавати токен', async () => {
            const inputData = { title: 'New Book', price: '150.50', count: '10' };
            const token = 'fake-token-123';
            localStorage.setItem('token', token);

            api.post.mockResolvedValueOnce({ data: { id: 5, ...inputData } });

            await bookService.createBook(inputData);

            expect(api.post).toHaveBeenCalledWith(
                '/books',
                {
                    title: 'New Book',
                    price: 150.50,
                    count: 10,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
        });

        test('має ставити 0 для ціни та кількості, якщо дані некоректні (fallback логіка)', async () => {
            const inputData = { title: 'Invalid Data', price: 'abc', count: null };
            api.post.mockResolvedValueOnce({ data: {} });

            await bookService.createBook(inputData);

            expect(api.post).toHaveBeenCalledWith(
                '/books',
                expect.objectContaining({
                    price: 0,
                    count: 0,
                }),
                expect.anything(),
            );
        });
    });

    test('deleteBook має викликати метод DELETE за правильним ID', async () => {
        api.delete.mockResolvedValueOnce({ data: { message: 'Deleted' } });

        const result = await bookService.deleteBook(123);

        expect(api.delete).toHaveBeenCalledWith('/books/123');
        expect(result).toEqual({ message: 'Deleted' });
    });
});
