import React from "react";
import "./FavoriteList.css";

const favoriteProducts = [
    {
        id: 1,
        name: "Mũ lưỡi trai",
        color: "Green",
        quantity: 1,
        price: "220,000 đ",
        image: "https://via.placeholder.com/100x100?text=Cap",
    },
    {
        id: 2,
        name: "Túi tote",
        color: "Green",
        quantity: 1,
        price: "220,000 đ",
        image: "https://via.placeholder.com/100x100?text=Tote",
    },
];

export default function FavoriteList() {
    return (
        <div className="personal-favorite-list-container">
            <h2 className="personal-favorite-list-title">Sản phẩm yêu thích</h2>
            <div className="personal-favorite-list-list">
                {favoriteProducts.map((item) => (
                    <div className="personal-favorite-list-item" key={item.id}>
                        <img
                            src={item.image}
                            alt={item.name}
                            className="personal-favorite-list-image"
                        />
                        <div className="personal-favorite-list-info">
                            <div className="personal-favorite-list-name">{item.name}</div>
                            <div className="personal-favorite-list-color">
                                Color: {item.color}
                            </div>
                            <div className="personal-favorite-list-qty">X {item.quantity}</div>
                        </div>
                        <div className="personal-favorite-list-price">{item.price}</div>
                        <button className="personal-favorite-list-add-btn">+ Giỏ hàng</button>
                    </div>
                ))}
            </div>
        </div>
    );
}