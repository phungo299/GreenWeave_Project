import React, { useState, useEffect } from 'react';
import './AdminStatisticPage.css';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Legend } from 'recharts';
import { LineChart, Line } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import Breadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import visitorLogService from '../../services/visitorLogService';
import orderService from '../../services/orderService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminStatisticPage = () => {
    const [visitorStats, setVisitorStats] = useState({
        totalVisits: 0,
        uniqueVisitors: 0,
        dailyVisits: [],
        topPages: [],
        isLoading: true
    });
    
    const [orderStats, setOrderStats] = useState({
        currentMonth: {
            totalOrders: 0,
            revenue: 0,
            deliveredOrders: 0,
            statusBreakdown: []
        },
        yearlyRevenue: {
            total: 0,
            monthlyData: []
        },
        period: {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            monthName: ''
        },
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

    useEffect(() => {
        const fetchOrderStats = async () => {
            try {
                const response = await orderService.getOrderStats();
                if (response.success) {
                    setOrderStats({
                        ...response.data,
                        isLoading: false
                    });
                }
            } catch (error) {
                console.error('Error fetching order stats:', error);
                setOrderStats(prev => ({ ...prev, isLoading: false }));
            }
        };
        fetchOrderStats();
    }, []);

    // Calculate today's visits
    const today = new Date().getDate();
    const todayVisits = visitorStats.dailyVisits.find(
        item => parseInt(item.date.split('/')[0]) === today
    )?.visits || 0;
    
    // Calculate this month's visits
    const thisMonthVisits = visitorStats.dailyVisits.reduce((total, item) => {
        return total + (item.visits || 0);
    }, 0);
    
    // Calculate this month's unique visitors chart data
    const thisMonthUniqueVisitors = visitorStats.dailyVisits.map((item, index) => ({
        name: item.date,
        value: item.uniqueVisitors || 0
    }));
    
    // Handler for period change
    const handlePeriodChange = (period) => {
        setSelectedPeriod(period);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    };

    // Format large numbers
    const formatLargeNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
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
                            <h3>Doanh thu tháng {orderStats.period.month}</h3>
                            <span className="gw-admin-statistic-period">{orderStats.period.monthName.toUpperCase()}</span>
                        </div>
                        <div className="gw-admin-statistic-value">
                            {orderStats.isLoading ? '...' : formatLargeNumber(orderStats.currentMonth.revenue)}
                        </div>
                        <div className="gw-admin-statistic-chart">
                            <ResponsiveContainer width="100%" height={100}>
                                <BarChart data={orderStats.yearlyRevenue.monthlyData}>
                                    <Bar dataKey="revenue" fill="#4318FF" />
                                    <Tooltip 
                                        formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                                        labelFormatter={(label) => `Tháng ${label}`}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="gw-admin-statistic-row">
                    {/* Customers Card - UPDATED to use uniqueVisitors */}
                    <div className="gw-admin-statistic-card">
                        <div className="gw-admin-statistic-card-header">
                            <h3>Khách hàng (Unique Visitors)</h3>
                            <span className="gw-admin-statistic-period">{selectedPeriod.toUpperCase()}</span>
                        </div>
                        <div className="gw-admin-statistic-value">
                            {visitorStats.isLoading ? '...' : visitorStats.uniqueVisitors.toLocaleString()}
                        </div>
                        <div className="gw-admin-statistic-chart">
                            <ResponsiveContainer width="100%" height={100}>
                                <LineChart data={thisMonthUniqueVisitors}>
                                    <Line type="monotone" dataKey="value" stroke="#4318FF" strokeWidth={2} dot={false} />
                                    <Tooltip 
                                        formatter={(value) => [value, 'Unique Visitors']}
                                        labelFormatter={(label) => `Ngày ${label}`}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    {/* Orders Card */}
                    <div className="gw-admin-statistic-card">
                        <div className="gw-admin-statistic-card-header">
                            <h3>Đơn hàng tháng {orderStats.period.month}</h3>
                            <span className="gw-admin-statistic-period">HIỆN TẠI: {orderStats.isLoading ? '...' : orderStats.currentMonth.totalOrders}</span>
                        </div>
                        <div className="gw-admin-statistic-value">
                            {orderStats.isLoading ? '...' : orderStats.currentMonth.totalOrders}
                        </div>
                        <div className="gw-admin-progress-container">
                            <div className="gw-admin-progress-bar">
                                <div 
                                    className="gw-admin-progress-fill"
                                    style={{ width: `${Math.min((orderStats.currentMonth.totalOrders / 1000) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <span className="gw-admin-progress-text">
                                Mục tiêu: 1,000 đơn (còn {Math.max(1000 - orderStats.currentMonth.totalOrders, 0)} đơn)
                            </span>
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
                                    <Bar name="Người dùng" dataKey="uniqueVisitors" fill="#00C49F" />
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
                        <h3>Doanh thu năm {orderStats.period.year}</h3>
                        <span className="gw-admin-statistic-period">TỔNG CỘNG</span>
                    </div>
                    <div className="gw-admin-bestsellers-content">
                        <div className="gw-admin-bestsellers-value-container">
                            <div className="gw-admin-bestsellers-value">
                                {orderStats.isLoading ? '...' : formatLargeNumber(orderStats.yearlyRevenue.total)}
                            </div>
                            <div className="gw-admin-bestsellers-subtitle">— Tổng doanh thu</div>
                        </div>
                        <div className="gw-admin-bestsellers-list">
                            <div className="gw-admin-bestsellers-item">
                                Tháng {orderStats.period.month}: {orderStats.isLoading ? '...' : formatCurrency(orderStats.currentMonth.revenue)}
                            </div>
                            <div className="gw-admin-bestsellers-item">
                                Đơn đã giao: {orderStats.isLoading ? '...' : orderStats.currentMonth.deliveredOrders.toLocaleString()}
                            </div>
                            <div className="gw-admin-bestsellers-item">
                                Trung bình/tháng: {orderStats.isLoading ? '...' : formatCurrency(orderStats.yearlyRevenue.total / orderStats.period.month)}
                            </div>
                        </div>
                        <div className="gw-admin-bestsellers-chart">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={orderStats.yearlyRevenue.monthlyData.filter(item => item.revenue > 0)}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="revenue"
                                        nameKey="name"
                                    >
                                        {orderStats.yearlyRevenue.monthlyData.filter(item => item.revenue > 0).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                {/* Recent Orders Card */}
                <div className="gw-admin-statistic-card gw-admin-recent-orders">
                    <div className="gw-admin-statistic-card-header">
                        <h3>Thống kê đơn hàng tháng {orderStats.period.month}</h3>
                        <div className="gw-admin-toggle-switch">
                            {/* Add toggle switch here if needed */}
                        </div>
                    </div>
                    <table className="gw-admin-orders-table">
                        <thead>
                            <tr>
                                <th>Trạng thái</th>
                                <th>Số lượng</th>
                                <th>Tổng giá trị</th>
                                <th>Tỷ lệ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderStats.isLoading ? (
                                <tr>
                                    <td colSpan="4" className="gw-admin-loading">Đang tải...</td>
                                </tr>
                            ) : orderStats.currentMonth.statusBreakdown.length > 0 ? (
                                orderStats.currentMonth.statusBreakdown.map((status, index) => (
                                    <tr key={index}>
                                        <td>
                                            <span className={`gw-admin-order-status ${status._id.toLowerCase()}`}>
                                                {orderService.getStatusText(status._id)}
                                            </span>
                                        </td>
                                        <td>{status.count.toLocaleString()}</td>
                                        <td>{formatCurrency(status.totalAmount)}</td>
                                        <td>{((status.count / orderStats.currentMonth.totalOrders) * 100).toFixed(1)}%</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="gw-admin-no-data">Không có dữ liệu đơn hàng</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default AdminStatisticPage;