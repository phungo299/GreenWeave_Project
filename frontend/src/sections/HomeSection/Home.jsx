import React, { useEffect, useState } from 'react';
import Background from '../../assets/images/home-background.jpg';
import './Home.css';

const Home = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = Background;
        img.onload = () => {
            setIsLoaded(true);
        };
    }, []);
    return (
        <section id="home" className={`home-section ${isLoaded ? 'loaded' : 'loading'}`}>
            <div className="home-background" style={{ backgroundImage: `url(${Background})` }}>
                <div className="home-container">
                    <div className="color-palette-container">
                        <div className="color-palette">
                            <div className="color-dots">
                                <div className="color-dot black" data-color="Black"></div>
                                <div className="color-dot dark-green" data-color="Dark Green"></div>
                                <div className="color-dot aqua-green" data-color="Aqua Green"></div>
                                <div className="color-dot mint-green" data-color="Mint Green"></div>
                            </div>
                            <div className="palette-bubble"></div>
                        </div>
                        <div className="material-text">
                            <div className="material-percentage">100%</div>
                            <div className="material-description">Vật liệu tái chế</div>
                        </div>
                    </div>
                    <div className="brand-content">
                        <h1 className="brand-name">Greenweave</h1>
                        <p className="brand-slogan">Thời trang bền vững - Cho tương lai xanh</p>
                        <div className="cta-buttons">
                            <button className="buy-now-btn">Mua ngay</button>
                            <a href="#learn-more" className="learn-more-link">Tìm hiểu thêm</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default Home;
