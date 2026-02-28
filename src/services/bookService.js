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
            image_url: bookData.image_url || bookData.image,
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

    getBookReviews: async (bookId) => {
        const response = await api.get(`/books/${bookId}/reviews`);
        return response.data;
    },

    addReview: async (reviewData) => {
        const response = await api.post('/reviews', reviewData);
        return response.data;
    },
};

export default bookService;
