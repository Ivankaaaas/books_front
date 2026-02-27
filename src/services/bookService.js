import api from './api';

const bookService = {
    getAllBooks: async () => {
        const response = await api.get('/books');
        return response.data;
    },

    getBookById: async (id) => {
        const response = await api.get(`/books/${id}`);
        return response.data;
    },

    getSimilarBooks: async (bookId) => {
        const response = await api.get(`/books/random/similar?exclude_id=${bookId}`);
        return response.data;
    },
};

export default bookService;
