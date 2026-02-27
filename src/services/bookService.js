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

    createBook: async (bookData) => {
        const cleanData = {
            ...bookData,
            price: Number(bookData.price) || 0,
            count: Number(bookData.count) || 0,
        };

        const token = localStorage.getItem('token');

        const response = await api.post('/books', cleanData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    },

    deleteBook: async (id) => {
        const response = await api.delete(`/books/${id}`);
        return response.data;
    },
};

export default bookService;
