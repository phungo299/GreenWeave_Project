import React from 'react';
import './OrderList.css';

// Sample product image import
// import productImage from '../../assets/images/product-sample.jpg';

const OrderList = () => {
    // Sample order data - in a real app this would come from an API
    const orders = [
        {
            id: 1,
            name: 'Mũ lưỡi trai',
            color: 'Green',
            quantity: 1,
            price: '220,000 đ',
            status: 'Đang xử lý',
            image: 'https://via.placeholder.com/80x80'
        },
        {
            id: 2,
            name: 'Mũ lưỡi trai',
            color: 'Green',
            quantity: 1,
            price: '220,000 đ',
            status: 'Đã giao hàng',
            image: 'https://via.placeholder.com/80x80'
        }
    ];
  
    return (
        <div className="personal-orders-container">
            <h2 className="personal-section-title">Đơn hàng</h2>  
            <div className="personal-orders-list">
                {orders.map(order => (
                    <div key={order.id} className="personal-order-item">
                        <img 
                            src={order.image} 
                            alt={order.name} 
                            className="personal-order-image" 
                        />          
                        <div className="personal-order-details">
                            <h3 className="personal-order-title">{order.name}</h3>
                            <p className="personal-order-color">Color: {order.color}</p>
                            <p className="personal-order-quantity">x{order.quantity}</p>
                            <p className="personal-order-price">{order.price}</p>
                        </div>
                        <div className={`personal-order-status ${order.status === 'Đang xử lý' ? 'pending' : 'delivered'}`}>
                            {order.status}
                        </div>
                        <div className="personal-order-buttons">
                            <button className="personal-order-button detail">Chi tiết</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default OrderList; 