import React, { useEffect, useState } from "react";
import axios from "axios";
import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "../../../../firebase";
import { BiSolidLike, BiSolidDislike } from "react-icons/bi";

import Avatar from "./Avatar";
import "./Response.scss";

export default function Response({ habitatId, avt, transcript, setTranscript, setFade }) {
    const [response, setResponse] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [animation, setAnimation] = useState("pensando");

    useEffect(() => {
        const sendTranscript = async () => {
            setLoading(true);
            try {
                const res = await axios.post("https://roko.flowfuse.cloud/talkwithifc", {
                    msg: transcript,
                    avt: avt
                });

                setResponse(res.data.comandos);
                setLoading(false);
                setAnimation("falando-sorrindo"); // Muda a animação quando começa a resposta
            } catch (error) {
                console.error("Error sending transcript: ", error);
                setLoading(false);
            }
        };

        if (transcript !== "") {
            sendTranscript();
            setAnimation("pensando"); // Muda a animação para "pensando" enquanto carrega
        }
    }, [transcript, avt, setFade]);

    useEffect(() => {
        if (!loading && response.length > 0) {
            playAudioSequentially(0);
        }
    }, [loading, response]);

    const playAudioSequentially = async (index) => {
        if (index < response.length) {
            setCurrentIndex(index);
            const comando = response[index];

            if (comando.audio) {
                const audio = new Audio(comando.audio);
                audio.onloadedmetadata = () => {
                    setFade([{ fade: comando.fade, duration: audio.duration + 2 }]); // Adding 2 seconds to the audio duration
                };
                audio.play();
                audio.onended = () => {
                    playAudioSequentially(index + 1);
                };
            } else {
                playAudioSequentially(index + 1);
            }
        } else {
            setShowFeedback(true);
            setTimeout(() => {
                setShowFeedback(false);
                setResponse([]);
                setTranscript("");
                setAnimation("pensando"); // Volta para a animação "pensando" ao final da interação
            }, 5000); // Increased the time to 5 seconds
        }
    };

    const handleFeedback = async (type) => {
        const feedbackData = {
            question: transcript,
            response: response.map(r => r.texto).join(" "), // Combine all response texts
            feedback: type,
        };

        try {
            const feedbackRef = doc(collection(db, `habitats/${habitatId}/feedback`));
            await setDoc(feedbackRef, feedbackData);
        } catch (error) {
            console.error("Erro ao enviar feedback: ", error);
        }

        setShowFeedback(false);
    };

    return (
        <div className="response-container">
            {transcript !== "" && (
                <div className="question">
                    <p>{transcript}</p>
                </div>
            )}
            {loading ? (
                <div className="loading-response">
                    <Avatar animation={animation} /> 
                    <div className="loading-response-text">
                        <p>Carregando Resposta...</p>
                    </div>
                </div>
            ) : (
                <div className={`response ${response.length === 0 ? "response-exit" : ""}`}>
                    {response.length > 0 && (
                        <>
                            <Avatar animation={animation} />
                            <div className="response-text">
                                <p>{response[currentIndex]?.texto}</p>
                                {showFeedback && (
                                    <div className="feedback-container">
                                        <button
                                            onClick={() => handleFeedback("like")}
                                            className="like"
                                        >
                                            <BiSolidLike color="#333" size={20}/>
                                        </button>
                                        <button
                                            onClick={() => handleFeedback("dislike")}
                                            className="dislike"
                                        >
                                            <BiSolidDislike color="#333" size={20}/>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}