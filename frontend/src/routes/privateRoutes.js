import CartPage from '../pages/CartPage';
import PaymentPage from '../pages/PaymentPage';
import PaymentStatus from '../statuspages/paymentstatus/PaymentStatus';
import Personal from '../pages/Personal';
import OrderList from '../personalpage/order/OrderList';
import OrderDetails from '../personalpage/order/OrderDetails';
import FavoriteList from '../personalpage/favoritelist/FavoriteList';
import PersonalAddress from '../personalpage/address/PersonalAddress';
import ChangePassword from '../personalpage/changepassword/ChangePassword';
import PersonalInformation from '../personalpage/personalinformation/PersonalInformation';

// Create a sample route structure for pages to be developed later
const placeholderPage = () => (
    <div style={{ padding: '20px' }}>
        <h1>Trang đang được phát triển</h1>
        <p>Nội dung đang được xây dựng. Vui lòng quay lại sau.</p>
    </div>
);

// Personal page sub-components
const personalChildren = [
    {
        path: '',
        component: OrderList
    },
    {
        path: 'orders',
        component: OrderList
    },
    {
        path: 'orders/:id',
        component: OrderDetails
    },
    {
        path: 'favorites',
        component: FavoriteList
    },
    {
        path: 'address',
        component: PersonalAddress
    },
    {
        path: 'change-password',
        component: ChangePassword
    },
    {
        path: 'profile',
        component: PersonalInformation
    },
    {
        path: 'settings',
        component: placeholderPage
    }
];

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
    {
        path: '/personal/*',
        component: Personal,
        children: personalChildren
    }
];

export default privateRoutes;