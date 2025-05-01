import AdminLayout from '../components/layout/adminlayout/AdminLayout';
import AdminDashboard from '../adminpages/AdminDashboard';
import AdminStatisticPage from '../adminpages/statisticpage/AdminStatisticPage';

// import AdminProductsPage from '../adminpages/AdminProductsPage';
// import AdminOrdersPage from '../adminpages/AdminOrdersPage';
// import AdminCustomersPage from '../adminpages/AdminCustomersPage';
// import AdminReviewsPage from '../adminpages/AdminReviewsPage';
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
                component: placeholderPage
            },
            {
                path: 'orders',
                component: placeholderPage
            },
            {
                path: 'customers',
                component: placeholderPage
            },
            {
                path: 'reviews',
                component: placeholderPage
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