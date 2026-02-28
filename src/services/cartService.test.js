import cartService from './cartService';
import api from './api';

jest.mock('./api');

describe('cartService Coverage 100%', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getCart має повертати дані кошика для конкретного користувача', async () => {
        const mockCart = { items: [{ id: 1, title: 'Книга' }], total: 100 };
        api.get.mockResolvedValueOnce({ data: mockCart });

        const result = await cartService.getCart(123);

        expect(api.get).toHaveBeenCalledWith('/cart?user_id=123');
        expect(result).toEqual(mockCart);
    });

    test('addToCart має додавати книгу в кошик через POST параметри', async () => {
        const mockResponse = { message: 'Added' };
        api.post.mockResolvedValueOnce({ data: mockResponse });

        const result = await cartService.addToCart(1, 456);

        expect(api.post).toHaveBeenCalledWith('/cart/add?book_id=1&user_id=456');
        expect(result).toEqual(mockResponse);
    });

    test('updateQuantity має викликати PATCH з параметром action', async () => {
        const mockResponse = { success: true };
        api.patch.mockResolvedValueOnce({ data: mockResponse });

        const result = await cartService.updateQuantity(10, 'increase');

        expect(api.patch).toHaveBeenCalledWith(
            '/cart/update/10',
            null,
            { params: { action: 'increase' } },
        );
        expect(result).toEqual(mockResponse);
    });

    test('removeFromCart має видаляти товар за ID', async () => {
        const mockResponse = { message: 'Removed' };
        api.delete.mockResolvedValueOnce({ data: mockResponse });

        const result = await cartService.removeFromCart(99);

        expect(api.delete).toHaveBeenCalledWith('/cart/99');
        expect(result).toEqual(mockResponse);
    });
});
