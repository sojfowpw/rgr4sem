import React, {useState, useEffect} from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import "./styles/InfoDevice.css";

const InfoDevice = () => {
    const { id } = useParams();
    const [device, setDevice] = useState({
        ip: "",
        type_: "", 
        location: "",
        status: ""
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token'); 
        const fetchDeviceData = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/device/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.data.status === "success") {
                    setDevice(response.data.device);
                }
            }
            catch (err) {
                setError(err.response?.data?.detail || "Ошибка получения данных");
            }
        };
        fetchDeviceData();
    }, [id]);

    return (
        <div>
            <Header />
            <div className="info_device_back">Информация об устройстве</div>
            {error && <div className="error-message">{error}</div>}
            <div className="device_back"></div>
            <div className="device_front">
                <div style={{display: "flex", alignItems: "center", marginBottom: "2px", padding: "20px"}}>
                    <div style={{fontSize: "20px", fontWeight: "bold", marginRight: "116px",
                    color: device.type_ === 1 ? "blue" : device.type_ === 2 ? "red" : "black"}}>
                    Тип: {device.type_ === 1 ? "роутер" : device.type_ === 2 ? "свитч" : device.type_}</div>
                </div>
                <div style={{display: "flex", alignItems: "center", marginBottom: "8px", padding: "20px"}}>
                    <div style={{fontSize: "20px", fontWeight: "bold", marginRight: "116px"}}>IP: {device.ip}</div>
                </div>
                <div style={{display: "flex", alignItems: "center", marginBottom: "4px", padding: "20px"}}>
                    <div style={{fontSize: "20px", fontWeight: "bold", marginRight: "116px"}}>Местоположение: {device.location}</div>
                </div>
                <div style={{display: "flex", alignItems: "center", marginBottom: "12px", padding: "20px"}}>
                    <div style={{fontSize: "20px", fontWeight: "bold", marginRight: "116px",
                    color: device.status === "В сети" ? "#4CAF50" : "#ff4a4a"}}>Статус: {device.status}</div>
                </div>
            </div>
            <button className="button_device_back" onClick={() => navigate('/devices')}>Назад</button>
        </div>
    );
};

export default InfoDevice;