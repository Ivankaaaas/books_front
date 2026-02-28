import apiClient from './api';

describe('apiClient (axios instance) Coverage 100%', () => {
    test('має правильну базову конфігурацію', () => {
        expect(apiClient.defaults.baseURL).toBe('http://127.0.0.1:8000/api');

        expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    });

    test('інтерцептор відповіді (success) має просто повертати відповідь', () => {
        const mockResponse = { data: { success: true }, status: 200 };

        const onResponseSuccess = apiClient.interceptors.response.handlers[0].fulfilled;

        const result = onResponseSuccess(mockResponse);
        expect(result).toEqual(mockResponse);
    });

    test('інтерцептор відповіді (error) має відхиляти проміс із помилкою', async () => {
        const mockError = new Error('Network Error');

        const onResponseError = apiClient.interceptors.response.handlers[0].rejected;

        await expect(onResponseError(mockError)).rejects.toThrow('Network Error');
    });
});
