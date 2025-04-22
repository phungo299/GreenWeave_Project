import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check token in localStorage when component is mounted
    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            
            if (token && userData) {
                try {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            
            setLoading(false);
        };
        
        checkToken();
    }, []);

    // Login function
    const login = async (credentials) => {
        try {
            // TODO: Implement API call for login
            // const response = await api.post('/api/auth/login', credentials);
            // const { token, user } = response.data;
            
            // Mock đăng nhập thành công - sẽ thay thế bằng API thực tế
            const mockUser = {
                id: '123',
                username: credentials.username,
                email: `${credentials.username}@example.com`,
                role: 'user'
            };
            const mockToken = 'mock-jwt-token';
            
            localStorage.setItem('token', mockToken);
            localStorage.setItem('user', JSON.stringify(mockUser));
            
            setUser(mockUser);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Đăng nhập không thành công'
            };
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    };

    // Registration function
    const register = async (userData) => {
        try {
            // TODO: Implement API call for registration
            // const response = await api.post('/api/auth/register', userData);
            // return { success: true, data: response.data };
            
            // Mock đăng ký thành công - sẽ thay thế bằng API thực tế
            return { success: true, data: { message: 'Đăng ký thành công' } };
        } catch (error) {
            console.error('Registration error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Đăng ký không thành công'
            };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            loading,
            login,
            logout,
            register
        }}>
            {children}
        </AuthContext.Provider>
    );
}; 