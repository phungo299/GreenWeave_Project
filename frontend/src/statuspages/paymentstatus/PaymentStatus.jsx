import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import successIcon from '../../assets/icons/icon-pay-success.png';
import failIcon from '../../assets/icons/icon-pay-fail.png';
import './PaymentStatus.css';

const PaymentStatus = () => {
    // Get payment status from URL params (success or failed)
    const { status } = useParams();
    const isSuccess = status === 'success';

    return (
        <>
            <Header />
            <div className="payment-status-container">
                <div className="payment-status-box">
                    <h1 className={`payment-status-title ${isSuccess ? 'success' : 'fail'}`}>
                        {isSuccess ? 'Thanh toán thành công' : 'Thanh toán không thành công'}
                    </h1>                   
                    <div className="payment-status-icon">
                        <img src={isSuccess ? successIcon : failIcon} alt={isSuccess ? 'Success Icon' : 'Fail Icon'} />
                    </div>                   
                    <div className="payment-status-message">
                        {isSuccess ? (
                            <>
                                <h3>Cảm ơn bạn đã mua sắm</h3>
                                <p>Đơn hàng của bạn đã được đặt thành công và hiện đang được xử lý.</p>
                            </>
                        ) : (
                            <>
                                <h3>Oops! Có vấn đề xảy ra</h3>
                                <p>Có lỗi xảy ra khi xử lý đơn hàng của bạn.<br />Vui lòng kiểm tra lại thông tin và thử lại.</p>
                            </>
                        )}
                    </div>                   
                    <div className="payment-status-button">
                        {isSuccess ? (
                            <Link to="/account" className="back-btn success-btn">
                                Về trang cá nhân <span className="arrow">→</span>
                            </Link>
                        ) : (
                            <Link to="/payment" className="back-btn fail-btn">
                                Quay lại trang thanh toán <span className="arrow">→</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};
export default PaymentStatus;