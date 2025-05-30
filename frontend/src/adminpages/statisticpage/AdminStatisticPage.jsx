import React, { useState, useEffect } from 'react';
import './AdminStatisticPage.css';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Legend } from 'recharts';
import { LineChart, Line } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import Breadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import visitorLogService from '../../services/visitorLogService';

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
    const [visitorStats, setVisitorStats] = useState({
        totalVisits: 0,
        uniqueVisitors: 0,
        dailyVisits: [],
        topPages: [],
        isLoading: true
    });
    
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [deviceStats, setDeviceStats] = useState([]);
    const [browserStats, setBrowserStats] = useState([]);

    useEffect(() => {
        const fetchVisitorStats = async () => {
            try {
                const response = await visitorLogService.getVisitorStats(selectedPeriod);
                const formattedStats = visitorLogService.formatVisitorStats(response);              
                // Calculate device and browser stats from the response if available
                if (response.deviceStats) {
                    setDeviceStats(response.deviceStats.map(item => ({
                        name: item._id || 'Unknown',
                        value: item.count
                    })));
                }               
                if (response.browserStats) {
                    setBrowserStats(response.browserStats.map(item => ({
                        name: item._id || 'Unknown',
                        value: item.count
                    })));
                }               
                setVisitorStats({
                    ...formattedStats,
                    isLoading: false
                });
            } catch (error) {
                console.error('Error fetching visitor stats:', error);
                setVisitorStats(prev => ({ ...prev, isLoading: false }));
            }
        };
        fetchVisitorStats();
    }, [selectedPeriod]);

    // Calculate today's visits
    const today = new Date().getDate();
    const todayVisits = visitorStats.dailyVisits.find(
        item => parseInt(item.date.split('/')[0]) === today
    )?.visits || 0;
    
    // Calculate this month's visits
    const thisMonthVisits = visitorStats.dailyVisits.reduce((total, item) => {
        return total + (item.visits || 0);
    }, 0);
    
    // Handler for period change
    const handlePeriodChange = (period) => {
        setSelectedPeriod(period);
    };

    return (
        <div className="gw-admin-statistic-container">
            <Breadcrumb /> 
            <div className="gw-admin-statistic-grid">
                <div className="gw-admin-statistic-row">
                    {/* Visitor Stats Card */}
                    <div className="gw-admin-statistic-card">
                        <div className="gw-admin-statistic-card-header">
                            <h3>Lượt truy cập</h3>
                            <span className="gw-admin-statistic-period">TỔNG CỘNG</span>
                        </div>
                        <div className="gw-admin-statistic-value">
                            {visitorStats.isLoading ? '...' : visitorStats.totalVisits.toLocaleString()}
                        </div>
                        <div className="gw-admin-visitor-metrics">
                            <div className="gw-admin-visitor-metric-item">
                                <span className="gw-admin-visitor-metric-label">Người dùng khác nhau:</span>
                                <span className="gw-admin-visitor-metric-value">
                                    {visitorStats.isLoading ? '...' : visitorStats.uniqueVisitors.toLocaleString()}
                                </span>
                            </div>
                            <div className="gw-admin-visitor-metric-item">
                                <span className="gw-admin-visitor-metric-label">Hôm nay:</span>
                                <span className="gw-admin-visitor-metric-value">
                                    {visitorStats.isLoading ? '...' : todayVisits.toLocaleString()}
                                </span>
                            </div>
                            <div className="gw-admin-visitor-metric-item">
                                <span className="gw-admin-visitor-metric-label">Tháng này:</span>
                                <span className="gw-admin-visitor-metric-value">
                                    {visitorStats.isLoading ? '...' : thisMonthVisits.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
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
                </div>
                <div className="gw-admin-statistic-row">
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
            </div>
            <div className="gw-admin-visitor-row">
                <div className="gw-admin-statistic-card gw-admin-visitor-chart-card">
                    <div className="gw-admin-statistic-card-header">
                        <h3>Thống kê truy cập</h3>
                        <div className="gw-admin-period-selector">
                            <button 
                                className={`gw-admin-period-btn ${selectedPeriod === 'day' ? 'active' : ''}`}
                                onClick={() => handlePeriodChange('day')}
                            >
                                Ngày
                            </button>
                            <button 
                                className={`gw-admin-period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
                                onClick={() => handlePeriodChange('week')}
                            >
                                Tuần
                            </button>
                            <button 
                                className={`gw-admin-period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
                                onClick={() => handlePeriodChange('month')}
                            >
                                Tháng
                            </button>
                        </div>
                    </div>
                    {visitorStats.isLoading ? (
                        <div className="gw-admin-loading">Đang tải...</div>
                    ) : (
                        <div className="gw-admin-visitor-chart">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={visitorStats.dailyVisits}>
                                    <XAxis dataKey="date" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar name="Lượt xem" dataKey="visits" fill="#4318FF" />
                                    {visitorStats.dailyVisits[0]?.uniqueVisitors !== undefined && (
                                        <Bar name="Người dùng" dataKey="uniqueVisitors" fill="#00C49F" />
                                    )}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>               
                <div className="gw-admin-statistic-card">
                    <div className="gw-admin-statistic-card-header">
                        <h3>Trang được truy cập nhiều nhất</h3>
                        <span className="gw-admin-statistic-period">TOP 5</span>
                    </div>
                    {visitorStats.isLoading ? (
                        <div className="gw-admin-loading">Đang tải...</div>
                    ) : (
                        <table className="gw-admin-visitor-table">
                            <thead>
                                <tr>
                                    <th>Đường dẫn</th>
                                    <th>Lượt xem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visitorStats.topPages.slice(0, 5).map((page, index) => (
                                    <tr key={index}>
                                        <td>{page.path}</td>
                                        <td>{page.count.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {visitorStats.topPages.length === 0 && (
                                    <tr>
                                        <td colSpan="2" className="gw-admin-no-data">Không có dữ liệu</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>           
            <div className="gw-admin-visitor-row">
                {/* Device distribution */}
                <div className="gw-admin-statistic-card">
                    <div className="gw-admin-statistic-card-header">
                        <h3>Thiết bị truy cập</h3>
                        <span className="gw-admin-statistic-period">{selectedPeriod.toUpperCase()}</span>
                    </div>
                    {visitorStats.isLoading ? (
                        <div className="gw-admin-loading">Đang tải...</div>
                    ) : deviceStats.length > 0 ? (
                        <div className="gw-admin-visitor-pie-container">
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={deviceStats}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        nameKey="name"
                                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {deviceStats.map((entry, index) => (
                                            <Cell key={`device-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => value.toLocaleString()} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="gw-admin-visitor-legend">
                                {deviceStats.map((entry, index) => (
                                    <div key={`legend-${index}`} className="gw-admin-visitor-legend-item">
                                        <div className="gw-admin-visitor-legend-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <div className="gw-admin-visitor-legend-text">{entry.name}: {entry.value.toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="gw-admin-no-data-container">Không có dữ liệu thiết bị</div>
                    )}
                </div>               
                {/* Browser distribution */}
                <div className="gw-admin-statistic-card">
                    <div className="gw-admin-statistic-card-header">
                        <h3>Trình duyệt</h3>
                        <span className="gw-admin-statistic-period">{selectedPeriod.toUpperCase()}</span>
                    </div>
                    {visitorStats.isLoading ? (
                        <div className="gw-admin-loading">Đang tải...</div>
                    ) : browserStats.length > 0 ? (
                        <div className="gw-admin-visitor-pie-container">
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={browserStats}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        nameKey="name"
                                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {browserStats.map((entry, index) => (
                                            <Cell key={`browser-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => value.toLocaleString()} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="gw-admin-visitor-legend">
                                {browserStats.map((entry, index) => (
                                    <div key={`legend-${index}`} className="gw-admin-visitor-legend-item">
                                        <div className="gw-admin-visitor-legend-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <div className="gw-admin-visitor-legend-text">{entry.name}: {entry.value.toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="gw-admin-no-data-container">Không có dữ liệu trình duyệt</div>
                    )}
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