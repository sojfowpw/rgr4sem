import React from "react";
import Header from "./Header";
import "./styles/Home.css";

const Home = () => {
    return (
        <div>
            <Header />
            <h1 style={{textAlign: "center", margin: "18px", fontSize: "24px"}}>Обеспечение безопасности в образовательных организациях</h1>
            <div style={{display: "flex", justifyContent: "center"}}>
                <button className="button_login" onClick={() => window.location.href='/login'}>Вход</button>
                <button className="button_registr" onClick={() => window.location.href='/registration'}>Регистрация</button>
            </div>
        </div>
    );
};

export default Home;