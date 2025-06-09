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

    // Generate or get session ID
    getSessionId: () => {
        let sessionId = sessionStorage.getItem('visitor_session_id');
        if (!sessionId) {
            // Tạo session ID duy nhất
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('visitor_session_id', sessionId);
        }
        return sessionId;
    },

    // Parse user agent to get device, browser, OS information
    parseUserAgent: (userAgent) => {
        const ua = userAgent.toLowerCase();        
        // Detect OS
        let os = 'Unknown';
        if (ua.includes('windows nt 10.0')) os = 'Windows 10';
        else if (ua.includes('windows nt 6.3')) os = 'Windows 8.1';
        else if (ua.includes('windows nt 6.2')) os = 'Windows 8';
        else if (ua.includes('windows nt 6.1')) os = 'Windows 7';
        else if (ua.includes('windows')) os = 'Windows';
        else if (ua.includes('mac os x')) os = 'macOS';
        else if (ua.includes('linux')) os = 'Linux';
        else if (ua.includes('android')) os = 'Android';
        else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

        // Detect Browser
        let browser = 'Unknown';
        if (ua.includes('edg/')) browser = 'Microsoft Edge';
        else if (ua.includes('chrome/') && !ua.includes('edg/')) browser = 'Chrome';
        else if (ua.includes('firefox/')) browser = 'Firefox';
        else if (ua.includes('safari/') && !ua.includes('chrome/')) browser = 'Safari';
        else if (ua.includes('opera/') || ua.includes('opr/')) browser = 'Opera';

        // Detect Device Type
        let device = 'Desktop';
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            device = 'Mobile';
        } else if (ua.includes('tablet') || ua.includes('ipad')) {
            device = 'Tablet';
        }

        return { device, browser, os };
    },

    // Get geolocation (optional, requires user permission)
    getGeolocation: () => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve({ country: '', city: '' });
                return;
            }
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        // Use reverse geocoding API (e.g. OpenCageData, or other service)
                        // This is just an example, you need the actual API key
                        const response = await fetch(
                            `https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=YOUR_API_KEY`
                        );
                        const data = await response.json();                        
                        if (data.results && data.results.length > 0) {
                            const location = data.results[0].components;
                            resolve({
                                country: location.country || '',
                                city: location.city || location.town || location.village || ''
                            });
                        } else {
                            resolve({ country: '', city: '' });
                        }
                    } catch (error) {
                        console.error('Geolocation API error:', error);
                        resolve({ country: '', city: '' });
                    }
                },
                () => {
                    // User denied permission or error occurred
                    resolve({ country: '', city: '' });
                },
                { timeout: 5000 }
            );
        });
    },

    // Track a page visit with enhanced data collection
    trackPageVisit: async (path, authContext = null) => {
        try {
            // Get basic info
            const userAgent = navigator.userAgent;
            const referer = document.referrer;
            const sessionId = visitorLogService.getSessionId();
            
            // Parse user agent
            const { device, browser, os } = visitorLogService.parseUserAgent(userAgent);
            
            // Get user ID if authenticated
            let userId = null;
            if (authContext && authContext.isAuthenticated && authContext.user) {
                userId = authContext.user.id;
            }
            
            // Create log data
            const logData = {
                ipAddress: '127.0.0.1', // This will be replaced by the server with real IP
                userAgent,
                referer,
                path,
                method: 'GET',
                userId,
                sessionId,
                device,
                browser,
                os,
                country: '', // Will be filled by server or geolocation
                city: ''     // Will be filled by server or geolocation
            };
            // Optional: Try to get geolocation (uncomment if needed)
            // const location = await visitorLogService.getGeolocation();
            // logData.country = location.country;
            // logData.city = location.city;            
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