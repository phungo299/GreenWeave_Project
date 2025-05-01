import React from 'react';
import './AdminStatisticPage.css';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { LineChart, Line } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import Breadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';

const salesData = [
    { name: '1', value: 400 },
    { name: '2', value: 300 },
    { name: '3', value: 600 },
    { name: '4', value: 800 },
    { name: '5', value: 500 },
    // Add more data points as needed
];

const customerData = [
    { name: '1', value: 400 },
    { name: '2', value: 600 },
    { name: '3', value: 300 },
    { name: '4', value: 700 },
    { name: '5', value: 500 },
];

const bestSellersData = [
    { name: 'Mũ lưỡi trai', value: 220000 },
    { name: 'Túi tote', value: 220000 },
    { name: 'Áo phông', value: 220000 },
];

const recentOrders = [
    { category: 'Áo phông', date: '20 Mar, 2023', total: '220,000 đ', status: 'processing' },
    { category: 'Mũ lưỡi trai', date: '19 Mar, 2023', total: '220,000 đ', status: 'cancelled' },
    { category: 'Túi tote', date: '7 Feb, 2023', total: '220,000 đ', status: 'delivered' },
    { category: 'Balo', date: '29 Jan, 2023', total: '220,000 đ', status: 'delivered' },
    { category: 'Áo phông', date: '27 Jan, 2023', total: '220,000 đ', status: 'cancelled' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminStatisticPage = () => {
    return (
        <div className="gw-admin-statistic-container">
            <Breadcrumb /> 
            <div className="gw-admin-statistic-top-row">
                {/* Sales Card */}
                <div className="gw-admin-statistic-card">
                    <div className="gw-admin-statistic-card-header">
                        <h3>Tổng doanh số</h3>
                        <span className="gw-admin-statistic-period">THÁNG NÀY</span>
                    </div>
                    <div className="gw-admin-statistic-value">1M</div>
                    <div className="gw-admin-statistic-chart">
                        <ResponsiveContainer width="100%" height={100}>
                            <BarChart data={salesData}>
                                <Bar dataKey="value" fill="#4318FF" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {/* Customers Card */}
                <div className="gw-admin-statistic-card">
                    <div className="gw-admin-statistic-card-header">
                        <h3>Khách hàng</h3>
                        <span className="gw-admin-statistic-period">THÁNG NÀY</span>
                    </div>
                    <div className="gw-admin-statistic-value">2,571</div>
                    <div className="gw-admin-statistic-chart">
                        <ResponsiveContainer width="100%" height={100}>
                            <LineChart data={customerData}>
                                <Line type="monotone" dataKey="value" stroke="#4318FF" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {/* Orders Card */}
                <div className="gw-admin-statistic-card">
                    <div className="gw-admin-statistic-card-header">
                        <h3>Đơn hàng</h3>
                        <span className="gw-admin-statistic-period">MỤC TIÊU hàng tháng: 1,000</span>
                    </div>
                    <div className="gw-admin-statistic-value">734</div>
                    <div className="gw-admin-progress-container">
                        <div className="gw-admin-progress-bar">
                            <div 
                                className="gw-admin-progress-fill"
                                style={{ width: '73.4%' }}
                            ></div>
                        </div>
                        <span className="gw-admin-progress-text">Còn 266 Đơn</span>
                    </div>
                </div>
            </div>
            <div className="gw-admin-statistic-bottom-row">
                {/* Best Sellers Card */}
                <div className="gw-admin-statistic-card gw-admin-bestsellers">
                    <div className="gw-admin-statistic-card-header">
                        <h3>Bán chạy nhất</h3>
                        <span className="gw-admin-statistic-period">THÁNG NÀY</span>
                    </div>
                    <div className="gw-admin-bestsellers-content">
                        <div className="gw-admin-bestsellers-value-container">
                            <div className="gw-admin-bestsellers-value">1M</div>
                            <div className="gw-admin-bestsellers-subtitle">— Tổng doanh số</div>
                        </div>
                        <div className="gw-admin-bestsellers-list">
                            {bestSellersData.map((item, index) => (
                                <div key={index} className="gw-admin-bestsellers-item">
                                    <span>{item.name} — {item.value.toLocaleString()} đ</span>
                                </div>
                            ))}
                        </div>
                        <div className="gw-admin-bestsellers-chart">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={bestSellersData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {bestSellersData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                {/* Recent Orders Card */}
                <div className="gw-admin-statistic-card gw-admin-recent-orders">
                    <div className="gw-admin-statistic-card-header">
                        <h3>Đơn hàng gần đây</h3>
                        <div className="gw-admin-toggle-switch">
                            {/* Add toggle switch here if needed */}
                        </div>
                    </div>
                    <table className="gw-admin-orders-table">
                        <thead>
                            <tr>
                                <th>Phân loại</th>
                                <th>Ngày</th>
                                <th>Tổng</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order, index) => (
                                <tr key={index}>
                                    <td>{order.category}</td>
                                    <td>{order.date}</td>
                                    <td>{order.total}</td>
                                    <td>
                                        <span className={`gw-admin-order-status ${order.status.toLowerCase()}`}>
                                            {order.status === 'processing' && 'Đang xử lý'}
                                            {order.status === 'cancelled' && 'Đã hủy'}
                                            {order.status === 'delivered' && 'Đã Giao'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default AdminStatisticPage;