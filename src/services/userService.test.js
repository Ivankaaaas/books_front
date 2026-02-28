import userService from './userService';
import api from './api';

jest.mock('./api');

describe('userService Coverage 100%', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getAllUsers має повертати список усіх користувачів', async () => {
        const mockUsers = [
            { id: 1, email: 'user1@test.com' },
            { id: 2, email: 'user2@test.com' },
        ];
        api.get.mockResolvedValueOnce({ data: mockUsers });

        const result = await userService.getAllUsers();

        expect(api.get).toHaveBeenCalledWith('/users');
        expect(result).toEqual(mockUsers);
    });

    test('getUserById має повертати дані конкретного користувача за ID', async () => {
        const mockUser = { id: 5, email: 'user5@test.com' };
        api.get.mockResolvedValueOnce({ data: mockUser });

        const result = await userService.getUserById(5);

        expect(api.get).toHaveBeenCalledWith('/users/5');
        expect(result).toEqual(mockUser);
    });

    test('updateUser має надсилати PATCH запит із новими даними', async () => {
        const updateData = { first_name: 'Оновлене' };
        const mockResponse = { id: 10, ...updateData };
        api.patch.mockResolvedValueOnce({ data: mockResponse });

        const result = await userService.updateUser(10, updateData);

        expect(api.patch).toHaveBeenCalledWith('/users/10', updateData);
        expect(result).toEqual(mockResponse);
    });

    test('deleteUser має надсилати DELETE запит за правильним ID', async () => {
        const mockResponse = { message: 'Користувача видалено' };
        api.delete.mockResolvedValueOnce({ data: mockResponse });

        const result = await userService.deleteUser(99);

        expect(api.delete).toHaveBeenCalledWith('/users/99');
        expect(result).toEqual(mockResponse);
    });
});
