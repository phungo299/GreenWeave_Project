import axios from 'axios';

// Create an instance of axios
const axiosClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Timeout after 10 seconds
});

// Interceptor for request (eg: attach token)
axiosClient.interceptors.request.use(
    (config) => {
        // Get token from localStorage if available
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
axiosClient.interceptors.response.use(
    (response) => response.data,  // Return data directly
    (error) => {
        // Handle common errors
        if (error.response) {
            const { status, data } = error.response;
            
            // Client Errors (4xx)
            switch (status) {
                case 400:
                    // Bad Request
                    console.error('Bad Request:', data.message || 'Invalid request parameters');
                    break;
                case 401:
                    // Unauthorized
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    console.error('Unauthorized: Please login to continue');
                    break;
                case 402:
                    // Payment Required
                    console.error('Payment Required:', data.message || 'Payment is required to access this resource');
                    break;
                case 403:
                    // Forbidden
                    console.error('Forbidden:', data.message || 'You do not have permission to access this resource');
                    break;
                case 404:
                    // Not Found
                    console.error('Not Found:', data.message || 'The requested resource was not found');
                    break;
                case 405:
                    // Method Not Allowed
                    console.error('Method Not Allowed:', data.message || 'This HTTP method is not allowed');
                    break;
                case 406:
                    // Not Acceptable
                    console.error('Not Acceptable:', data.message || 'The server cannot produce a response matching the list of acceptable values');
                    break;
                case 407:
                    // Proxy Authentication Required
                    console.error('Proxy Authentication Required:', data.message || 'Proxy authentication is required');
                    break;
                case 408:
                    // Request Timeout
                    console.error('Request Timeout:', data.message || 'The request timed out');
                    break;
                case 409:
                    // Conflict
                    console.error('Conflict:', data.message || 'There was a conflict with the current state of the resource');
                    break;
                case 410:
                    // Gone
                    console.error('Gone:', data.message || 'The requested resource is no longer available');
                    break;
                case 411:
                    // Length Required
                    console.error('Length Required:', data.message || 'The Content-Length header is required');
                    break;
                case 412:
                    // Precondition Failed
                    console.error('Precondition Failed:', data.message || 'One or more conditions in the request header fields evaluated to false');
                    break;
                case 413:
                    // Payload Too Large
                    console.error('Payload Too Large:', data.message || 'The request payload is too large');
                    break;
                case 414:
                    // URI Too Long
                    console.error('URI Too Long:', data.message || 'The URI is too long');
                    break;
                case 415:
                    // Unsupported Media Type
                    console.error('Unsupported Media Type:', data.message || 'The media type is not supported');
                    break;
                case 416:
                    // Range Not Satisfiable
                    console.error('Range Not Satisfiable:', data.message || 'The requested range is not satisfiable');
                    break;
                case 417:
                    // Expectation Failed
                    console.error('Expectation Failed:', data.message || 'The expectation given in the Expect header could not be met');
                    break;
                case 422:
                    // Unprocessable Entity
                    console.error('Unprocessable Entity:', data.message || 'The request was well-formed but was unable to be followed due to semantic errors');
                    break;
                case 425:
                    // Too Early
                    console.error('Too Early:', data.message || 'The request was sent too early');
                    break;
                case 426:
                    // Upgrade Required
                    console.error('Upgrade Required:', data.message || 'The server requires an upgrade to a different protocol');
                    break;
                case 429:
                    // Too Many Requests
                    console.error('Too Many Requests:', data.message || 'Too many requests have been sent in a given amount of time');
                    break;

                // Server Errors (5xx)
                case 500:
                    // Internal Server Error
                    console.error('Internal Server Error:', data.message || 'An unexpected error occurred on the server');
                    break;
                case 501:
                    // Not Implemented
                    console.error('Not Implemented:', data.message || 'The server does not support the functionality required to fulfill the request');
                    break;
                case 502:
                    // Bad Gateway
                    console.error('Bad Gateway:', data.message || 'The server received an invalid response from the upstream server');
                    break;
                case 503:
                    // Service Unavailable
                    console.error('Service Unavailable:', data.message || 'The server is temporarily unable to handle the request');
                    break;
                case 504:
                    // Gateway Timeout
                    console.error('Gateway Timeout:', data.message || 'The upstream server failed to send a request in the time allowed by the server');
                    break;
                case 505:
                    // HTTP Version Not Supported
                    console.error('HTTP Version Not Supported:', data.message || 'The server does not support the HTTP protocol version used in the request');
                    break;
                case 507:
                    // Insufficient Storage
                    console.error('Insufficient Storage:', data.message || 'The server is unable to store the representation needed to complete the request');
                    break;
                case 508:
                    // Loop Detected
                    console.error('Loop Detected:', data.message || 'The server detected an infinite loop while processing the request');
                    break;
                case 510:
                    // Not Extended
                    console.error('Not Extended:', data.message || 'Further extensions to the request are required for the server to fulfill it');
                    break;
                case 511:
                    // Network Authentication Required
                    console.error('Network Authentication Required:', data.message || 'The client needs to authenticate to gain network access');
                    break;
                default:
                    console.error('An error occurred:', data.message || 'Unknown error');
            }

            // Return a standardized error object
            return Promise.reject({
                status: error.response.status,
                message: data.message || 'An error occurred',
                data: data
            });
        }

        // Handle network errors
        if (error.request) {
            console.error('Network Error:', 'No response received from server');
            return Promise.reject({
                status: 0,
                message: 'Network Error: No response received from server',
                data: null
            });
        }

        // Handle other errors
        console.error('Error:', error.message);
        return Promise.reject({
            status: 0,
            message: error.message || 'An unexpected error occurred',
            data: null
        });
    }
);
export default axiosClient;