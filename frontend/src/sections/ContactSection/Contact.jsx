import React, { useState } from 'react';
import './Contact.css';
import AnimatedSection from '../../components/common/AnimatedSection';

const Contact = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate form submission
        setTimeout(() => {
            console.log('Email submitted:', email);
            console.log('Message submitted:', message);
            
            // Reset the form
            setEmail('');
            setMessage('');
            setIsSubmitting(false);
            setSubmitSuccess(true);
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                setSubmitSuccess(false);
            }, 3000);
        }, 1000);
    };

    return (
        <section id="contact" className="contact-section">
            <div className="contact-container">
                {/* Header with Animation */}
                <AnimatedSection animation="slideUp" delay={0.2}>
                    <div className="contact-header">
                        <AnimatedSection animation="slideUp" delay={0.4}>
                            <h2 className="contact-title">Gửi thông tin, yêu cầu</h2>
                        </AnimatedSection>
                        <AnimatedSection animation="slideUp" delay={0.6}>
                            <p className="contact-subtitle">Gửi thông tin, feedback hoặc có vấn đề về sản phẩm.</p>
                            <p className="contact-subtitle">Hãy liên hệ cho chúng tôi.</p>
                        </AnimatedSection>
                    </div>
                </AnimatedSection>

                {/* Form with Animation */}
                <AnimatedSection animation="slideUp" delay={0.8}>
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <AnimatedSection animation="slideLeft" delay={1.0}>
                            <div className="contact-form-group">
                                <input 
                                    type="email" 
                                    className="contact-input" 
                                    placeholder="Địa chỉ Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </AnimatedSection>
                        
                        <AnimatedSection animation="slideRight" delay={1.2}>
                            <div className="contact-form-group">
                                <textarea 
                                    className="contact-textarea" 
                                    placeholder="Nội dung tin nhắn của bạn..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows="4"
                                    required
                                    disabled={isSubmitting}
                                ></textarea>
                            </div>
                        </AnimatedSection>
                        
                        <AnimatedSection animation="zoomIn" delay={1.4} hoverEffect="zoom">
                            <div className="contact-submit-container">
                                <button 
                                    type="submit" 
                                    className={`contact-submit-btn ${isSubmitting ? 'submitting' : ''} ${submitSuccess ? 'success' : ''}`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Đang gửi...' : submitSuccess ? 'Đã gửi!' : 'Gửi'}
                                </button>
                            </div>
                        </AnimatedSection>
                        
                        {/* Success Message */}
                        {submitSuccess && (
                            <AnimatedSection animation="slideUp" delay={0.1}>
                                <div className="contact-success-message">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>Cảm ơn bạn! Chúng tôi sẽ phản hồi sớm nhất có thể.</span>
                                </div>
                            </AnimatedSection>
                        )}
                    </form>
                </AnimatedSection>
            </div>
        </section>
    );
};
export default Contact;
