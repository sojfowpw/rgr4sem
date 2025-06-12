import React, {useState, useEffect} from "react";
import { useNavigate} from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import "./styles/Devices.css";

const Devices = () => {
    const [devices, setDevices] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token'); 
        const fetchDevicesData = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/devices", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            if (response.data.status === "success") {
                setDevices(response.data.devices);
            }
        }
        catch (err) {
            setError(err.response?.data?.detail || "Ошибка получения данных");
        }
    };
        fetchDevicesData();
    }, []);

    return (
        <div>
            <Header />
            <div className="devices_admin_back">Список устройств</div>
            <div className="list_devices_back"></div>
            <div className="list_devices_front">
                <ul style={{listStyle: "none", padding: 0, margin: 0}}>
                    {devices.map(device => (
                        <li key={device.id} style={{padding: "12px 16px", borderBottom: "3px solid #f4f4f4", backgroundColor: '#fff',
                        display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                            <div style={{flex: 1}}>
                                <div style={{fontWeight: "bold", color: "black"}}>Устройство: {device.ip}</div>
                                <div style={{fontWeight: "bold", color: device.status === "В сети" ? "#4CAF50" : "#ff4a4a", marginTop: "8px"}}>
                                Статус: {device.status}</div>
                            </div>
                            <button className="button_delete"  onClick={() => navigate(`/device/${device.id}`)}
                            style={{alignSelf: "flex-start"}}>Подробнее</button>
                        </li>
                    ))}
                </ul>
            </div>
            <button className="button_main_back" onClick={() => navigate('/main')}>Назад</button>
        </div>
    );
};

export default Devices;