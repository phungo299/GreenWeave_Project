import React, { useEffect, useState } from 'react';
import messageService from '../../services/messageService';
import Breadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import './AdminMessageList.css';

const AdminMessageList = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await messageService.getAll();
                setMessages(res.messages || res.data || []);
            } catch (err) {
                console.error('Error fetching messages:', err);
                setError(err.message || 'Có lỗi xảy ra');
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, []);

    if (loading) {
        return (
            <div className="admin-message-list-container">
                <Breadcrumb />
                <p>Đang tải tin nhắn...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-message-list-container">
                <Breadcrumb />
                <p className="error-text">{error}</p>
            </div>
        );
    }

    return (
        <div className="admin-message-list-container">
            <Breadcrumb />
            <h2 className="admin-message-title">Tin nhắn liên hệ</h2>
            <div className="admin-message-table-wrapper">
                <table className="admin-message-table">
                    <thead>
                        <tr>
                            <th>Họ tên</th>
                            <th>Email</th>
                            <th>SĐT</th>
                            <th>Chủ đề</th>
                            <th>Nội dung</th>
                            <th>Ngày gửi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {messages.map(msg => (
                            <tr key={msg._id}>
                                <td>{msg.name}</td>
                                <td>{msg.email}</td>
                                <td>{msg.phone || '-'}</td>
                                <td>{msg.subject || '-'}</td>
                                <td className="message-content-cell">{msg.message}</td>
                                <td>{new Date(msg.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                        {messages.length === 0 && (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Không có tin nhắn</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default AdminMessageList; 