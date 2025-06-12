import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import "./styles/Login.css";

const Login = () => {
    const [formData, setFormData] = useState({
        login: "",
        pass: ""
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("http://127.0.0.1:8000/login", {
                login: formData.login,
                password: formData.pass
            });
            
            if (response.data.status === "success") {
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('user_id', response.data.id); 
                if (response.data.role === 2) {
                    navigate("/main/admin");
                } else if (response.data.role === 1) {
                    navigate("/main");
                }
            }
        }
        catch (err) {
            setError(err.response?.data?.detail || "Неверный логин или пароль");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        navigate('/');
    };

    return (
        <div>
            <Header />
            <div className="back_form">Вход</div>
            <div className="login_back_form"></div>
            <form className="registr_front_form" onSubmit={handleSubmit}>
                <div style={{display: "flex", alignItems: "center", marginBottom: "12px", padding: "20px"}}>
                    <label htmlFor="login" style={{fontSize: "20px", fontWeight: "bold", marginRight: "127px"}}>Логин:</label>
                    <input type="text" id="login" value={formData.login} onChange={handleChange} style={{padding: "8px", width: "300px"}} required />
                </div>

                <div style={{display: "flex", alignItems: "center", marginBottom: "12px", padding: "20px"}}>
                    <label htmlFor="pass" style={{fontSize: "20px", fontWeight: "bold", marginRight: "116px"}}>Пароль:</label>
                    <input type="password" id="pass" value={formData.pass} onChange={handleChange} style={{padding: "8px", width: "300px"}} required />
                </div>

                <button type="submit" className="button_login_form">Сохранить</button>
            </form>
            <button className="button_login_back" onClick={handleLogout}>Назад</button>
            {error && <div style={{color: "red", textAlign: "center", marginTop: "500px", fontWeight: "bold", fontSize: "20px"}}>Ошибка: {error}</div>}
        </div>
    );
};

export default Login;
