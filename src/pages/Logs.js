import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import "./styles/Logs.css";

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState(""); 
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token'); 
        const fetchLogsData = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/logs", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.data.status === "success") {
                    setLogs(response.data.logs);
                }
            } catch (err) {
                setError(err.response?.data?.detail || "Ошибка получения данных");
            }
        };
        fetchLogsData();
    }, []);

    const filteredLogs = logs.filter(log => 
        log.device_ip.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div>
            <Header />
            <div className="logs_back">Логи устройств</div>
            <div className="list_logs_back"></div>
            <div className="list_logs_front">
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {filteredLogs.map(log => (
                        <li key={log.id} style={{ padding: "12px 16px", borderBottom: "3px solid #f4f4f4", backgroundColor: '#fff',
                        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: "bold", color: "black", marginBottom: "8px" }}>ip: {log.device_ip}</div>
                                <div style={{ fontWeight: "bold", color: log.new_status === "В сети" ? "#4CAF50" : "#ff4a4a" }}>
                                    Статус: {log.new_status}
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: "bold", color: "black", marginBottom: "8px" }}>Время последнего сканирования: {log.time.substring(0, 8)}</div>
                                <div style={{ fontWeight: "bold", color: "black", marginBottom: "8px" }}>Дата последнего сканирования: {log.date}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <button className="button_logs_back" onClick={() => navigate('/main')}>Назад</button>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "100px", marginRight: "30px" }}>
            <input type="text" placeholder="Введите IP устройства" value={filter} onChange={(e) => setFilter(e.target.value)} 
            style={{ padding: "8px", width: "200px" }}/>
            </div>
        </div>
    );
};

export default Logs;
