import CartPage from '../pages/CartPage';
import PaymentPage from '../pages/PaymentPage';
import PaymentStatus from '../statuspages/paymentstatus/PaymentStatus';
// TODO: Create Profile page after API
// import ProfilePage from '../pages/ProfilePage';

const privateRoutes = [
    {
        path: '/cart',
        component: CartPage
    },
    {
        path: '/payment',
        component: PaymentPage
    },
    {
        path: '/payment-status',
        component: PaymentStatus
    },
    // TODO: Add Profile page after API available
    // {
    //     path: '/profile',
    //     component: ProfilePage
    // }
];

export default privateRoutes;
