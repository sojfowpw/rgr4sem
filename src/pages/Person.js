import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import "./styles/Person.css";

const Person = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    
    const nameRef = useRef(null);
    const surnameRef = useRef(null);

    useEffect(() => {
        const loadPerson = async () => {
            const token = localStorage.getItem('token'); 
            try {
                const response = await axios.get(`http://127.0.0.1:8000/people/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.data.status === "success") {
                    if (nameRef.current && surnameRef.current) {
                        nameRef.current.value = response.data.name;
                        surnameRef.current.value = response.data.surname;
                    }
                }
            }
            catch (err) {
                setError(err.response?.data?.detail || "Ошибка получения данных");
            }
        };
        loadPerson();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token'); 
        
        if (!/^[a-zA-Zа-яА-ЯёЁ]+$/.test(nameRef.current.value)) {
            setError("Имя может содержать только буквы");
            return;
        }

        if (!/^[a-zA-Zа-яА-ЯёЁ]+$/.test(surnameRef.current.value)) {
            setError("Фамилия может содержать только буквы");
            return;
        }

        try {
            const updatedData = {
                name: nameRef.current.value,
                surname: surnameRef.current.value
            };
            const response = await axios.put(`http://127.0.0.1:8000/people/${id}`, updatedData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (response.data.status === "success") {
                navigate("/people");
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Ошибка при обновлении данных");
        }
    };

    return (
        <div>
            <Header />
            <div className="back_person">Редактирование информации</div>
            <div className="person_back_detail"></div>
                <form onSubmit={handleSubmit} className="person_front_detail">
                    <div style={{display: "flex", alignItems: "center", marginBottom: "12px", padding: "20px"}}>
                        <label htmlFor="name" style={{fontSize: "20px", fontWeight: "bold", marginRight: "75px"}}>Имя:</label>
                        <input id="name" type="text" ref={nameRef} style={{padding: "8px", width: "300px"}} required />
                    </div>

                    <div style={{display: "flex", alignItems: "center", marginBottom: "12px", padding: "20px"}}>
                        <label htmlFor="surname" style={{fontSize: "20px", fontWeight: "bold", marginRight: "30px"}}>Фамилия:</label>
                        <input id="surname" type="text" ref={surnameRef} style={{padding: "8px", width: "300px"}} required />
                    </div>

                    <div style={{display: "flex", alignItems: "center", marginBottom: "12px", padding: "20px", marginLeft: "-30px"}}>
                        <button type="submit" className="button_person_form">Сохранить</button>
                    </div>
                </form>
            <button className="button_person_back" onClick={() => navigate('/people')}>Назад</button>
            {error && <div style={{color: "red", textAlign: "center", marginTop: "500px", fontWeight: "bold", fontSize: "20px"}}>Ошибка: {error}</div>}
        </div>
    );
};

export default Person;