import React, { useState, useEffect } from "react";
import Button from "../part/Button";
import { ROOT_LINK } from "../util/Constants";
import AppContext_test from "../page/master-test/TestContext";

export default function KMS_Sidebar({ onChangePage, questionNumbers, selectedQuestion, setSelectedQuestion, answerStatus, checkMainContent, quizId, timeRemaining, setTimeRemaining }) {
  const [remainingTime, setRemainingTime] = useState(5000);
  useEffect(() => {
  const timer = setInterval(() => {
    setRemainingTime(prevTime => {
      if (prevTime <= 1) {
        clearInterval(timer);
        setTimeRemaining(true);
      }
      return prevTime - 1;
    });
  }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  function updateData() {
      AppContext_test.timeRemaining = true;
  }
  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  function exitReview() {
    onChangePage("pretest", true, quizId);
  }

  return (
    <div className="border-end h-100 pt-2 overflow-y-auto position-fixed" >
      {checkMainContent === 'test' &&(
      <div
        className="card mb-3 p-3 mx-auto"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.8)", width: "fit-content" }}
      >
        <p className="m-0">Time Remaining: {formatTime(remainingTime)}</p>
      </div>
      )}

      <div 
        className="grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', padding: '20px' }}
      >
        {[...Array(questionNumbers)].map((_, index) => (
          <button
            key={index}
            className={`box ${index + 1 === selectedQuestion ? "active" : ""}`}
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              textAlign: 'center',
              fontSize: '14px',
              cursor: 'pointer',
              color: index + 1 === selectedQuestion 
                ? "white"
                : answerStatus[index] === "correct" 
                    ? "#1abc9c"
                    : answerStatus[index] === "incorrect" 
                        ? "#e74c3c" 
                        : answerStatus[index] === "none" 
                            ? "black" 
                            : answerStatus[index] === "answered" 
                                ? "white"
                                : "black",


              backgroundColor: index + 1 === selectedQuestion 
                  ? "#106cfc" 
                  : answerStatus[index] 
                      ? answerStatus[index] === "correct" 
                          ? "#e9f7eb" 
                          : answerStatus[index] === "incorrect" 
                              ? "#ffe3e6" 
                              : answerStatus[index] === "none" 
                                  ? "white"
                                      : answerStatus[AppContext_test.indexTest - 1] == "answered"
                                          ? "#106cfc"          
                                          : "white"
                      : "white", 
              borderColor: index + 1 === selectedQuestion 
                  ? "#106cfc" 
                  : answerStatus[index] 
                      ? answerStatus[index] === "correct" 
                          ? "#28a745" 
                          : answerStatus[index] === "incorrect" 
                              ? "#dc3545" 
                              : answerStatus[index] === "none" 
                                  ? "lightgray"
                                      : answerStatus[index - 1] === "answered"
                                          ? "#106cfc" 
                                            : "lightgray"
                      : "lightgray", 
            }}
            onClick={() => setSelectedQuestion(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
      {checkMainContent === 'detail_test' &&(
      <div
        className="card mb-0 p-0 mx-auto"
        style={{ width: "90%" }}
      >
        <Button 
          classType="light py-2" 
          label="Exit Review" 
          onClick={exitReview} 
        />
      </div>
      )}
    </div>
  );
}