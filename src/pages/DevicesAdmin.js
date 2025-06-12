import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import "./styles/DevicesAdmin.css";

const DevicesAdmin = () => {
    const [devices, setDevices] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchDevicesData();
    }, []);

    const fetchDevicesData = async () => {
        const token = localStorage.getItem('token'); 
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

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token'); 
        if (!window.confirm("Вы уверены, что хотите удалить это устройство?")) {
            return;
        }
        try {
            const response = await axios.delete(`http://127.0.0.1:8000/device/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            if (response.data.status === "success") {
                fetchDevicesData();
            }
        }
        catch (err) {
            setError(err.response?.data?.detail || "Ошибка при удалении устройства");
        }
    };

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
                                <div style={{fontWeight: "bold", color: device.type_ === 1 ? "blue" : device.type_ === 2 ? "red" : "black",
                                marginBottom: "8px"}}>Тип: {device.type_ === 1 ? "роутер" : device.type_ === 2 ? "свитч" : device.type_}</div>
                                <div style={{fontWeight: "bold", color: "black"}}>Расположение: {device.location}</div>
                            </div>
                            <button className="button_delete" onClick={(e) => {e.preventDefault(); handleDelete(device.id);}}
                            style={{alignSelf: "flex-start"}}>Удалить</button>
                        </li>
                    ))}
                </ul>
            </div>
            <button className="button_adm_back" onClick={() => navigate('/main/admin')}>Назад</button>
        </div>
    );
};

export default DevicesAdmin;