import React from "react";
import { useParams } from "react-router-dom";
import "./OrderDetail.css";

const order = {
    id: "3354654654526",
    date: "Ngày 16 tháng 2 năm 2025",
    expected: "20 tháng 2 năm 2025",
    statusStep: 1, // 0: Ordered, 1: Prepared, 2: Shipping, 3: Delivered
    products: [
        {
            name: "Mũ lưỡi trai",
            color: "Green",
            quantity: 1,
            price: "220,000 đ",
            image: "https://via.placeholder.com/80x80",
        },
        {
            name: "Mũ lưỡi trai",
            color: "Green",
            quantity: 1,
            price: "220,000 đ",
            image: "https://via.placeholder.com/80x80",
        },
    ],
    payment: {
        method: "Visa *56",
        icon: "https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png",
    },
    shipping: {
        address: "847 Jewess Bridge Apt. 174\nLondon, UK 474-769-3919",
    },
    summary: {
        value: "440,000 đ",
        discount: "0 đ",
        shipping: "40,000 đ",
        total: "500,000 đ",
    },
};

const steps = [
    { label: "Đơn hàng đã được đặt", date: "Wed, 11th Jan" },
    { label: "Chuẩn bị hàng", date: "Wed, 11th Jan" },
    { label: "Đang vận chuyển", date: "Wed, 11th Jan" },
    { label: "Đã giao", date: "Expected by, Mon 16th" },
];

export default function OrderDetails() {
    const { id } = useParams();

    return (
        <div className="personal-order-details-container">
            <div className="personal-order-details-header">
                <h2 className="personal-order-details-title">Chi tiết đơn hàng</h2>
                <div className="personal-order-details-id">
                    Mã đơn hàng: <span>{id}</span>
                </div>
                <div className="personal-order-details-meta">
                    <span>
                        Ngày đặt hàng: <b>{order.date}</b>
                    </span>
                    <span className="personal-order-details-meta-sep">|</span>
                    <span className="personal-order-details-expected">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                            <path d="M12 8v5l4 2" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="10" stroke="#4CAF50" strokeWidth="2"/>
                        </svg>
                        Dự kiến giao hàng: <b>{order.expected}</b>
                    </span>
                </div>
            </div>
            <div className="personal-order-details-progress">
                <div className="personal-order-details-progress-line"></div>
                {steps.map((step, idx) => (
                    <div
                        key={idx}
                        className={`personal-order-details-step${idx <= order.statusStep ? " active" : ""}${idx === 0 ? " first" : ""}${idx === steps.length - 1 ? " last" : ""}`}
                    >
                        <div className="personal-order-details-step-label">{step.label}</div>
                        <div className="personal-order-details-step-dot" />
                        <div className="personal-order-details-step-date">{step.date}</div>
                    </div>
                ))}
            </div>
            <div className="personal-order-details-products">
                {order.products.map((p, idx) => (
                    <div className="personal-order-details-product" key={idx}>
                        <img src={p.image} alt={p.name} className="personal-order-details-product-img" />
                        <div className="personal-order-details-product-info">
                            <div className="personal-order-details-product-name">{p.name}</div>
                            <div className="personal-order-details-product-color">Color: {p.color}</div>
                            <div className="personal-order-details-product-qty">X{p.quantity}</div>
                        </div>
                        <div className="personal-order-details-product-price">{p.price}</div>
                    </div>
                ))}
            </div>
            <div className="personal-order-details-info">
                <div className="personal-order-details-payment">
                    <div className="personal-order-details-info-title">Thanh toán</div>
                    <div className="personal-order-details-payment-method">
                        {order.payment.method}
                        <img src={order.payment.icon} alt="Visa" className="personal-order-details-payment-icon" />
                    </div>
                </div>
                <div className="personal-order-details-shipping">
                    <div className="personal-order-details-info-title">Giao hàng</div>
                    <div className="personal-order-details-shipping-address">
                        Địa chỉ<br />
                        {order.shipping.address.split("\n").map((line, i) => (
                            <span key={i}>{line}<br /></span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="personal-order-details-summary">
                <div className="personal-order-details-summary-title">Tóm tắt đơn hàng</div>
                <div className="personal-order-details-summary-row">
                    <span>Giá trị</span>
                    <span>{order.summary.value}</span>
                </div>
                <div className="personal-order-details-summary-row">
                    <span>Giảm giá</span>
                    <span>{order.summary.discount}</span>
                </div>
                <div className="personal-order-details-summary-row">
                    <span>Phí Ship</span>
                    <span>{order.summary.shipping}</span>
                </div>
                <div className="personal-order-details-summary-row total">
                    <span>Tổng đơn</span>
                    <span>{order.summary.total}</span>
                </div>
            </div>
        </div>
    );
}