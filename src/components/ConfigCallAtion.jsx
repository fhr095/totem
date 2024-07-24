import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Certifique-se de que o caminho está correto
import { doc, getDoc, setDoc } from "firebase/firestore";
import "../styles/ConfigCallAction.scss";

export default function ConfigCallAction() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [activate, setActivate] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const callActionRef = doc(db, "callAction", "seplag");
                const docSnap = await getDoc(callActionRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setMessages(data.messages || []);
                    setActivate(data.activate || false);
                } else {
                    console.log("Nenhum documento encontrado!");
                }
            } catch (error) {
                console.error("Erro ao buscar dados: ", error);
            }
        };

        fetchData();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const callActionRef = doc(db, "callAction", "seplag");
            await setDoc(callActionRef, {
                messages,
                activate
            }, { merge: true });
            alert("Dados salvos com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar dados: ", error);
            alert("Erro ao salvar dados.");
        }
    };

    const addMessage = () => {
        if (newMessage.trim()) {
            setMessages([...messages, newMessage]);
            setNewMessage("");
        }
    };

    const removeMessage = (index) => {
        setMessages(messages.filter((_, i) => i !== index));
    };

    return (
        <div className="config-call-action">
            <form onSubmit={handleSave}>
                <div className="form-group">
                    <label htmlFor="newMessage">Nova mensagem:</label>
                    <input
                        type="text"
                        id="newMessage"
                        name="newMessage"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="button" onClick={addMessage}>Adicionar</button>
                </div>
                <div className="form-group">
                    <label htmlFor="activate">
                        Ativar:
                        <input
                            type="checkbox"
                            id="activate"
                            name="activate"
                            checked={activate}
                            onChange={(e) => setActivate(e.target.checked)}
                        />
                    </label>
                </div>
                <div className="form-group">
                    <label>Mensagens:</label>
                    <ul>
                        {messages.map((message, index) => (
                            <li key={index}>
                                {message} 
                                <button type="button" onClick={() => removeMessage(index)}>Remover</button>
                            </li>
                        ))}
                    </ul>
                </div>
                <button type="submit">Salvar</button>
            </form>
        </div>
    );
}
