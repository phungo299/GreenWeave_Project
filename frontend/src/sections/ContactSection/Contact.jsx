import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission here
        console.log('Email submitted:', email);
        console.log('Message submitted:', message);
        // Reset the form
        setEmail('');
        setMessage('');
    };

    return (
        <section id="contact" className="contact-section">
            <div className="contact-container">
                <div className="contact-header">
                    <h2 className="contact-title">Gửi thông tin, yêu cầu</h2>
                    <p className="contact-subtitle">Gửi thông tin, feedback hoặc có vấn đề về sản phẩm.</p>
                    <p className="contact-subtitle">Hãy liên hệ cho chúng tôi.</p>
                </div>
                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="contact-form-group">
                        <input 
                            type="email" 
                            className="contact-input" 
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="contact-form-group">
                        <textarea 
                            className="contact-textarea" 
                            placeholder="Your message content..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows="4"
                            required
                        ></textarea>
                    </div>
                    <div className="contact-submit-container">
                        <button type="submit" className="contact-submit-btn">Submit</button>
                    </div>
                </form>
            </div>
        </section>
    );
};
export default Contact;
