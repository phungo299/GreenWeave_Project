import React from 'react';
import '../assets/css/AdminDashboard.css';

const AdminDashboard = () => {
    return (
        <div className="admin-dashboard">
            <h1 className="dashboard-title">Bảng điều khiển</h1>
            <div className="dashboard-stats">
                <div className="stat-card">
                    <h3>Tổng đơn hàng</h3>
                    <p className="stat-value">254</p>
                </div>
                <div className="stat-card">
                    <h3>Doanh thu tháng</h3>
                    <p className="stat-value">14.560.000 đ</p>
                </div>
                <div className="stat-card">
                    <h3>Khách hàng mới</h3>
                    <p className="stat-value">48</p>
                </div>
                <div className="stat-card">
                    <h3>Sản phẩm</h3>
                    <p className="stat-value">126</p>
                </div>
            </div>     
            <div className="recent-section">
                <h2>Đơn hàng gần đây</h2>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Khách hàng</th>
                                <th>Ngày</th>
                                <th>Trạng thái</th>
                                <th>Tổng tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>#12345</td>
                                <td>Nguyễn Văn A</td>
                                <td>15/07/2023</td>
                                <td><span className="status completed">Hoàn thành</span></td>
                                <td>540.000 đ</td>
                            </tr>
                            <tr>
                                <td>#12346</td>
                                <td>Trần Thị B</td>
                                <td>15/07/2023</td>
                                <td><span className="status pending">Đang xử lý</span></td>
                                <td>290.000 đ</td>
                            </tr>
                            <tr>
                                <td>#12347</td>
                                <td>Lê Văn C</td>
                                <td>14/07/2023</td>
                                <td><span className="status shipped">Đang giao</span></td>
                                <td>1.240.000 đ</td>
                            </tr>
                            <tr>
                                <td>#12348</td>
                                <td>Phạm Thị D</td>
                                <td>14/07/2023</td>
                                <td><span className="status completed">Hoàn thành</span></td>
                                <td>360.000 đ</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default AdminDashboard; 