import AdminLayout from '../components/layout/adminlayout/AdminLayout';
import AdminDashboard from '../adminpages/AdminDashboard';
import AdminStatisticPage from '../adminpages/statisticpage/AdminStatisticPage';
import AdminProductList from '../adminpages/productlistpage/AdminProductList';
import AdminProductDetails from '../adminpages/productdetailspage/AdminProductDetails';
import AdminOrderList from '../adminpages/orderlistpage/AdminOrderList';
import UserList from '../adminpages/userlistpage/UserList';
import AdminReviewList from '../adminpages/reviewlistpage/AdminReviewList';
// import AdminSettingsPage from '../adminpages/AdminSettingsPage';

// Create a sample route structure for pages to be developed later
const placeholderPage = () => (
    <div style={{ padding: '20px' }}>
        <h1>Trang đang được phát triển</h1>
        <p>Nội dung đang được xây dựng. Vui lòng quay lại sau.</p>
    </div>
);

// Admin routes must use admin rights
const adminRoutes = [
    {
        path: '/admin',
        component: AdminLayout,
        auth: 'admin',
        children: [
            {
                path: '',
                component: AdminDashboard
            },
            {
                path: 'statistics',
                component: AdminStatisticPage
            },
            {
                path: 'products',
                component: AdminProductList
            },
            {
                path: 'products/add',
                component: AdminProductDetails
            },
            {
                path: 'products/edit/:id',
                component: AdminProductDetails
            },
            {
                path: 'orders',
                component: AdminOrderList
            },
            {
                path: 'users',
                component: UserList
            },
            {
                path: 'reviews',
                component: AdminReviewList
            },
            {
                path: 'settings',
                component: placeholderPage
            },
            {
                path: 'add',
                component: placeholderPage
            }
        ]
    }
];
export default adminRoutes;