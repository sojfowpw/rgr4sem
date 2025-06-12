import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import "./styles/Registration.css";

const Registration = () => {
    const [formData, setFormData] = useState({
        login: "",
        name: "",
        surname: "",
        pass: "",
        secondPass: ""
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

        if (formData.login.length < 4 || formData.login.length > 32) { // длина логина
            setError("Логин должен быть от 4 до 32 символов");
            return;
        }
    
        if (!/^[a-zA-Zа-яА-ЯёЁ0-9_]+$/.test(formData.login)) { // проверка на запрещённые символы
            setError("Логин может содержать только буквы, цифры и подчёркивания");
            return;
        }

        if (formData.pass !== formData.secondPass) { // совпадение паролей
            setError("Пароли не совпадают");
            return;
        }

        if (formData.pass.length < 4 || formData.pass.length > 32) { // длина логина
            setError("Пароль должен быть от 4 до 32 символов");
            return;
        }

        if (formData.pass.trim().length === 0) { // пробелы в пароле
            setError("Пароль не может состоять из одних пробелов");
            return;
        }

        if (!/[a-zA-Zа-яА-ЯёЁ]/.test(formData.pass)) { // наличие букв в пароле
            setError("Пароль должен содержать хотя бы одну букву");
            return;
        }

        if (!/[0-9]/.test(formData.pass)) { // наличие цифр в пароле
            setError("Пароль должен содержать хотя бы одну цифру");
            return;
        }

        if (!/^[a-zA-Zа-яА-ЯёЁ]+$/.test(formData.name)) { // проверка на запрещённые символы в имени
            setError("Имя может содержать только буквы");
            return;
        }

        if (!/^[a-zA-Zа-яА-ЯёЁ]+$/.test(formData.surname)) { // проверка на запрещённые символы в фамилии
            setError("Фамилия может содержать только буквы");
            return;
        }

        try {
            const response = await axios.post("http://127.0.0.1:8000/registration", {
                login: formData.login,
                password: formData.pass,
                name: formData.name,
                surname: formData.surname
            });

            if (response.data.status === "success") {
                navigate("/login");
            }
        }
        catch (err) {
            setError(err.response?.data?.detail || "Ошибка регистрации");
        }
    };

    return (
        <div>
            <Header />
            <div className="back_form">Регистрация</div>
            <div className="registr_back_form"></div>
            <form className="registr_front_form" onSubmit={handleSubmit}>
                <div style={{display: "flex", alignItems: "center", marginBottom: "12px", padding: "20px"}}>
                    <label htmlFor="login" style={{fontSize: "20px", fontWeight: "bold", marginRight: "116px"}}>Логин:</label>
                    <input type="text" id="login" value={formData.login} onChange={handleChange} style={{padding: "8px", width: "300px"}} required />

                    <label htmlFor="name" style={{fontSize: "20px", fontWeight: "bold", marginRight: "151px", marginLeft: "300px"}}>Имя:</label>
                    <input type="text" id="name" value={formData.name} onChange={handleChange} style={{padding: "8px", width: "300px"}} required />
                </div>

                <div style={{display: "flex", alignItems: "center", marginBottom: "12px", padding: "20px"}}>
                    <label htmlFor="pass" style={{fontSize: "20px", fontWeight: "bold", marginRight: "106px"}}>Пароль:</label>
                    <input type="password" id="pass" value={formData.pass} onChange={handleChange} style={{padding: "8px", width: "300px"}} required />

                    <label htmlFor="surname" style={{fontSize: "20px", fontWeight: "bold", marginRight: "105px", marginLeft: "300px"}}>Фамилия:</label>
                    <input type="text" id="surname" value={formData.surname} onChange={handleChange} style={{padding: "8px", width: "300px"}} required />
                </div>

                <div style={{display: "flex", alignItems: "center", marginBottom: "12px", padding: "20px"}}>
                    <label htmlFor="secondPass" style={{fontSize: "20px", fontWeight: "bold", marginRight: "10px"}}>Повторите пароль:</label>
                    <input type="password" id="secondPass" value={formData.secondPass} onChange={handleChange} style={{padding: "8px", width: "300px"}} required />
                    
                    <button type="submit" className="button_form">Сохранить</button>
                </div>
            </form>
            <button className="button_registr_back" onClick={() => window.location.href='/'}>Назад</button>
            {error && <div style={{color: "red", textAlign: "center", marginTop: "500px", fontWeight: "bold", fontSize: "20px"}}>Ошибка: {error}</div>}
        </div>
    );
};

export default Registration;