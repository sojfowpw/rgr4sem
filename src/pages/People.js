import React, {useState, useEffect} from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import "./styles/People.css";

const People = () => {
    const [people, setPeople] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchPeopleData();
    }, []);

    const fetchPeopleData = async () => {
        const token = localStorage.getItem('token'); 
        try {
            const response = await axios.get("http://127.0.0.1:8000/people", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            if (response.data.status === "success") {
                setPeople(response.data.employees);
            }
        }
        catch (err) {
        setError(err.response?.data?.detail || "Ошибка получения данных");
        }
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token'); 
        if (!window.confirm("Вы уверены, что хотите удалить этого пользователя?")) {
            return;
        }
        try {
            const response = await axios.delete(`http://127.0.0.1:8000/people/${id}`,{
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            if (response.data.status === "success") {
                fetchPeopleData();
            }
        }
        catch (err) {
            setError(err.response?.data?.detail || "Ошибка при удалении пользователя");
        }
    };    

    return (
        <div>
            <Header />
            <div className="people_back">Список работников</div>
            <div className="list_people_back"></div>
            <div className="list_people_front">
                <ul style={{listStyle: "none", padding: 0, margin: 0}}>
                    {people.map(person => (
                        <li key={person.id} style={{padding: "12px 16px", borderBottom: "3px solid #f4f4f4", backgroundColor: '#fff',
                            display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                            <Link to={`/people/${person.id}`} style={{textDecoration: "none", display: "block", padding: "8px", flexGrow: 1}}>
                                <div style={{fontWeight: "bold", color: "black"}}>Имя: {person.name_}</div>
                                <div style={{fontWeight: "bold", color: "black"}}>Фамилия: {person.surname}</div>
                            </Link>
                            <button className="button_delete" onClick={(e) => {e.preventDefault(); handleDelete(person.id);}} style={{alignSelf: "flex-start"}}>Удалить</button>
                        </li>
                    ))}
                </ul>
            </div>
            <button className="button_admin_back" onClick={() => navigate('/main/admin')}>Назад</button>
        </div>
    );
};

export default People;