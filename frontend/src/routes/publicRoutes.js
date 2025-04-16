import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';

const publicRoutes = [
    {
        path: '/', 
        component: LandingPage 
    },
    {
        path: '/login',
        component: Login
    }
    // Add more public routes here
];
export default publicRoutes;
