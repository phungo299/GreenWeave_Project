import axiosClient from '../api/axiosClient';

const visitorLogService = {
    // Get visitor statistics
    getVisitorStats: (period = 'week') => {
        return axiosClient.get('/visitor-logs/stats', {
            params: { period }
        });
    },

    // Get all visitor logs (admin only)
    getAllVisitorLogs: (params = {}) => {
        const { page = 1, limit = 10, startDate, endDate, country, path } = params;
        return axiosClient.get('/visitor-logs', {
            params: {
                page,
                limit,
                startDate,
                endDate,
                country,
                path
            }
        });
    },

    // Create a new visitor log
    createVisitorLog: (logData) => {
        return axiosClient.post('/visitor-logs', logData);
    },

    // Clean up old visitor logs (admin only)
    cleanupOldLogs: (days = 90) => {
        return axiosClient.delete('/visitor-logs/cleanup', {
            params: { days }
        });
    },

    // Track a page visit
    trackPageVisit: async (path) => {
        try {
            // Get user agent from the client side
            const userAgent = navigator.userAgent;
            const referer = document.referrer;     
            // Create log data
            const logData = {
                ipAddress: '127.0.0.1', // This will be replaced by the server
                userAgent,
                referer,
                path,
                method: 'GET'
            };     
            return await visitorLogService.createVisitorLog(logData);
        } catch (error) {
            console.error('Error tracking page visit:', error);
            // Silently fail to not interrupt user experience
            return null;
        }
    },

    // Format visitor statistics for display
    formatVisitorStats: (stats) => {
        if (!stats) return null;  
        // Process daily visits for charts
        const dailyVisits = stats.dailyVisits?.map(item => {
            let date;
            if (typeof item.date === 'string') {
                date = new Date(item.date);
            } else if (item._id) {
                // Handle MongoDB aggregation format
                date = new Date(item._id.year, item._id.month - 1, item._id.day);
            }
            return {
                date: date ? `${date.getDate()}/${date.getMonth() + 1}` : 'Unknown',
                visits: item.count || item.visits || 0,
                uniqueVisitors: item.uniqueVisitors || 0
            };
        }) || [];
        // Format top pages for display
        const topPages = stats.topPages?.map(page => ({
            path: page._id,
            count: page.count
        })) || [];
        return {
            totalVisits: stats.totalVisits || 0,
            uniqueVisitors: stats.uniqueVisitors || 0,
            dailyVisits,
            topPages
        };
    }
};
export default visitorLogService;