import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import "./styles/Main.css";

const Main = () => {
    const [userData, setUserData] = useState({
            name: "",
            surname: ""
        });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token'); 
            const user_id = localStorage.getItem('user_id');
            if (!user_id) {
                setError("ID пользователя не найден");
                return;
            }

            try {
                const response = await axios.get("http://127.0.0.1:8000/user", {
                    params: {
                        id: user_id 
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (response.data && (response.data.name !== undefined && response.data.surname !== undefined)) {
                    setUserData(response.data);
                } else {
                    setError("Неверный формат данных пользователя");
                }
            }
            catch (err) {
                setError(err.response?.data?.detail || 
                        err.response?.data?.message || 
                        "Ошибка при получении данных пользователя");
                console.error("Ошибка запроса:", err);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user_id');
        navigate('/');
    };

    return (
        <div>
            <Header />
            <h1 style={{ margin: "18px", fontSize: "24px" }}>Добро пожаловать, {userData.name} {userData.surname}</h1>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", margin: "20px 0"}}>
                <button className="button_emp_devices" onClick={() => navigate('/devices')}>Данные об устройствах</button>
                <button className="button_logs" onClick={() => navigate('/logs')}>Логи устройств</button>
            </div>
            <button className="button_main_out" onClick={handleLogout}>Выйти</button>
            {error && (<div style={{color: "red", textAlign: "center", marginTop: "500px", fontWeight: "bold", fontSize: "20px"}}>{error}</div>)}
        </div>
    );
};

export default Main;