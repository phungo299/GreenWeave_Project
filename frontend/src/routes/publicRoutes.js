import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import ProductOverviewPage from '../pages/ProductOverviewPage';
import ProductDetails from '../pages/ProductDetails';

const publicRoutes = [
    {
        path: '/', 
        component: LandingPage 
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/register',
        component: Register
    },
    {
        path: '/forgot-password',
        component: ForgotPassword
    },
    {
        path: '/reset-password',
        component: ResetPassword
    },
    {
        path: '/products',
        component: ProductOverviewPage
    },
    {
        path: '/products/:id',
        component: ProductDetails
    }
    // Add more public routes here
];
export default publicRoutes;
