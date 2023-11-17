import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './App.css'; 

const WelcomePage = ({ onStartSurvey }) => (
  <div className="welcome-page">
    <h1>Welcome to the Survey!</h1>
    <p>Click the button below to start the survey.</p>
    <button onClick={onStartSurvey}>Start Survey</button>
  </div>
);

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Fetch questions from the backend
    axios.get('https://survey-assessment.vercel.app/api/questions')
      .then(response => {
        console.log(response.data);
        setQuestions(response.data);
      })
      .catch(error => {
        console.error('Error fetching questions:', error);
      });
  }, []);

  const handleStartSurvey = () => {
    setShowWelcome(false);
    setCurrentQuestion(0);
  };

  const handleAnswer = (answer) => {
    const currentQuestionObj = questions[currentQuestion];
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestionObj._id]: answer,
    }));
    setCurrentQuestion((prevQuestion) => prevQuestion + 1);
  };

  const generateSessionId = () => {
    // Generate a random string of characters (you can use a more sophisticated method)
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const sessionIdLength = 10;
    let sessionId = '';
  
    for (let i = 0; i < sessionIdLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      sessionId += characters[randomIndex];
    }
  
    return sessionId;
  };
  

  const handleSubmit = () => {
    const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));
  
    // Send session ID and answers to the backend
    axios.post('https://survey-assessment.vercel.app/api/save-answer', { answers: answersArray, sessionId: generateSessionId() })
      .then(response => {
        if (response.data.success) {
          setCompleted(true);
  
          // Delay showing the welcome page after 5 seconds
          setTimeout(() => {
            setShowWelcome(true); // Show welcome page again
            setCompleted(false); // Reset completed state
          }, 5000);
        } else {
          console.error('Error submitting survey');
        }
      })
      .catch(error => {
        console.error('Error submitting survey:', error);
      });
  };
  

  return (
    <div className="app-container">
      {showWelcome && <WelcomePage onStartSurvey={handleStartSurvey} />}
      {questions?.length > 0 && !completed && !showWelcome && (
        <div className="survey-container">
          <h1>Welcome to the Survey!</h1>
          <p className="question-count">Question {currentQuestion + 1}/{questions.length}</p>
          {questions[currentQuestion] && (
            <>
              <p className="question-text">{questions[currentQuestion].text}</p>
              {questions[currentQuestion].type === 'rating' && (
                <div className="rating-options">
                  {Array.from(Array(questions[currentQuestion].options)).map((_, index) => (
                    <button key={index} onClick={() => handleAnswer(index + 1)}>
                      {index + 1}
                    </button>
                  ))}
                </div>
              )}

              {questions[currentQuestion].type === 'text' && (
                <div className="text-input">
                  <textarea
                    value={answers[questions[currentQuestion]._id] || ''}
                    onChange={(e) =>
                      setAnswers((prevAnswers) => ({
                        ...prevAnswers,
                        [questions[currentQuestion]._id]: e.target.value,
                      }))
                    }
                    placeholder="Type your answer here..."
                  ></textarea>
                </div>
              )}

              <button className="skip-submit" onClick={() => handleAnswer(null)}>
                {currentQuestion === questions.length - 1 ? 'Skip and Submit' : 'Skip'}
              </button>

              {currentQuestion >= questions.length - 1 && (
                <div className="submit-section">
                  <p className="submit-message">Are you sure you want to submit the survey?</p>
                  <button className="submit-button" onClick={handleSubmit}>Submit</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
     {completed && !showWelcome && (
        <div className="completed-message">
          <h1>Thank you for your time!</h1>
          <p>Redirecting to the welcome screen in 5 seconds...</p>
        </div>
      )}
    </div>
  );
};

export default App;

