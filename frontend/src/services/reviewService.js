import axiosClient from '../api/axiosClient.js';

const reviewService = {
    /**
        * Get reviews by product ID
        * @param {string} productId - ID of the product
        * @returns {Promise} - Promise with reviews data
    */
    getProductReviews: (productId) => {
        return axiosClient.get(`/reviews/product/${productId}`);
    },

    /**
        * Get reviews by user ID
        * @param {string} userId - ID of the user
        * @returns {Promise} - Promise with reviews data
    */
    getUserReviews: (userId) => {
        return axiosClient.get(`/reviews/user/${userId}`);
    },

    /**
     * Get all reviews for admin with full user and product information
     * @param {Object} params - Query parameters
     * @param {number} [params.page=1] - Page number
     * @param {number} [params.limit=10] - Number of results per page
     * @param {string} [params.sortBy='createdAt'] - Field to sort by
     * @param {string} [params.sortOrder='desc'] - Sort order (asc or desc)
     * @returns {Promise} - Promise with reviews data
     */
    getAllReviews: (params = {}) => {
        return axiosClient.get('/reviews/all', { params });
    },

    /**
     * Get review details by ID
     * @param {string} reviewId - ID of the review
     * @returns {Promise} - Promise with review data
     */
    getReviewById: (reviewId) => {
        return axiosClient.get(`/reviews/${reviewId}`);
    },

    /**
     * Search reviews with enhanced filters and keyword search
     * @param {Object} params - Search parameters
     * @param {string} [params.productId] - Filter by product ID
     * @param {string} [params.userId] - Filter by user ID
     * @param {number} [params.minRating] - Minimum rating (1-5)
     * @param {number} [params.maxRating] - Maximum rating (1-5)
     * @param {string} [params.keyword] - Search keyword in comment, username, email, product name, product title
     * @param {string} [params.startDate] - Start date (YYYY-MM-DD)
     * @param {string} [params.endDate] - End date (YYYY-MM-DD)
     * @param {number} [params.page=1] - Page number
     * @param {number} [params.limit=10] - Number of results per page
     * @param {string} [params.sortBy='createdAt'] - Field to sort by
     * @param {string} [params.sortOrder='desc'] - Sort order (asc or desc)
     * @returns {Promise} - Promise with search results
     */
    searchReviews: (params) => {
        return axiosClient.get('/reviews/search', { params });
    },

    /**
        * Create a new review
        * @param {Object} reviewData - Review data
        * @param {string} reviewData.userId - ID of the user creating the review
        * @param {string} reviewData.productId - ID of the product being reviewed
        * @param {number} reviewData.rating - Rating (1-5)
        * @param {string} [reviewData.comment] - Review comment
        * @returns {Promise} - Promise with created review data
    */
    createReview: (reviewData) => {
        return axiosClient.post('/reviews', reviewData);
    },

    /**
        * Update an existing review
        * @param {string} reviewId - ID of the review to update
        * @param {Object} updateData - Data to update
        * @param {number} [updateData.rating] - New rating (1-5)
        * @param {string} [updateData.comment] - New comment
        * @returns {Promise} - Promise with updated review data
    */
    updateReview: (reviewId, updateData) => {
        return axiosClient.put(`/reviews/${reviewId}`, updateData);
    },

    /**
        * Delete a review
        * @param {string} reviewId - ID of the review to delete
        * @returns {Promise} - Promise with deletion result
    */
    deleteReview: (reviewId) => {
        return axiosClient.delete(`/reviews/${reviewId}`);
    },
};
export default reviewService;