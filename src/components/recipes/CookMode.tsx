import React, { useState, useEffect, useRef } from "react";
import { Recipe, Step } from "../../types";
import { Timer, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

interface CookModeProps {
  recipe: Recipe;
  onClose: () => void;
}

export const CookMode: React.FC<CookModeProps> = ({ recipe, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerTotal, setTimerTotal] = useState(0);
  const [showTimerComplete, setShowTimerComplete] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const currentStep: Step | undefined = recipe.steps[currentStepIndex];
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && timerRunning) {
      setTimerRunning(false);
      setShowTimerComplete(true);
      // Play sound only once and store ref
      audioRef.current = new Audio("/timer.mp3");
      audioRef.current.play().catch(err => console.log("Audio playback error:", err));
    }
    
    return () => clearInterval(interval);
  }, [timerRunning, timeRemaining]);
  
  const startTimer = () => {
    if (currentStep?.timerMinutes) {
      setTimeRemaining(currentStep.timerMinutes * 60);
      setTimerTotal(currentStep.timerMinutes * 60);
      setTimerRunning(true);
      setTimerPaused(false);
    }
  };
  
  const resumeTimer = () => {
    setTimerRunning(true);
    setTimerPaused(false);
  };
  
  const stopTimer = () => {
    setTimerRunning(false);
    setTimerPaused(true);
  };
  
  const goToNextStep = () => {
    if (currentStepIndex < recipe.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setTimerRunning(false);
    }
  };
  
  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setTimerRunning(false);
    }
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Circular progress for timer
  const getTimerColor = () => {
    if (!timerTotal) return '#22c55e'; // green
    const percent = timeRemaining / timerTotal;
    if (percent > 0.5) return '#22c55e'; // green
    if (percent > 0.2) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  const timerProgress = timerTotal ? (timeRemaining / timerTotal) * 100 : 100;
  
  const handleOkPopup = () => {
    setShowTimerComplete(false);
    // Stop and reset audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  };
  
  if (!currentStep) {
    return <div>No steps found in this recipe.</div>;
  }
  
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Timer Complete Modal */}
      {showTimerComplete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center animate-fade-in min-w-[320px]">
            <CheckCircle size={80} className="text-green-500 mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold mb-2 text-green-700">Timer Complete!</h2>
            <p className="mb-4 text-lg">Great job! Move to the next step or repeat as needed.</p>
            <button
              className="btn-recipe-primary px-6 py-2 text-lg"
              onClick={handleOkPopup}
            >
              OK
            </button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <button 
          onClick={onClose}
          className="btn-recipe-secondary"
        >
          Exit Cook Mode
        </button>
        <h2 className="text-lg font-semibold">{recipe.title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm">Servings: {recipe.servings}</span>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto p-6 md:p-10 flex flex-col items-center">
        {/* Progress indicator */}
        <div className="w-full max-w-3xl mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {recipe.steps.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevStep}
                disabled={currentStepIndex === 0}
                className="p-1 rounded disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goToNextStep}
                disabled={currentStepIndex === recipe.steps.length - 1 || timerRunning}
                className={`p-1 rounded ${timerRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div className="h-2 bg-muted rounded overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${((currentStepIndex + 1) / recipe.steps.length) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Current step */}
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
              {currentStepIndex + 1}
            </div>
            <div className="flex-1">
              <p className="text-lg">{currentStep.description}</p>
              
              {currentStep.timerMinutes && (
                <div className="mt-4 flex items-center">
                  <Timer size={18} className="mr-2" />
                  <span>Timer: {currentStep.timerMinutes} minute{currentStep.timerMinutes !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Timer section */}
          {currentStep.timerMinutes && (
            <div className="mt-6 pt-4 border-t flex flex-col items-center">
              {timerRunning || timeRemaining > 0 ? (
                <>
                  <div className={`relative flex flex-col items-center justify-center mb-6 transition-all duration-500`}
                    style={{ minHeight: 180, overflow: 'visible' }}>
                    <svg width="180" height="180" className="z-10" style={{ overflow: 'visible' }}>
                      <circle
                        cx="90" cy="90" r="80"
                        stroke="#e5e7eb"
                        strokeWidth="14"
                        fill="none"
                      />
                      <circle
                        cx="90" cy="90" r="80"
                        stroke={getTimerColor()}
                        strokeWidth="14"
                        fill="none"
                        strokeDasharray={502.65}
                        strokeDashoffset={502.65 - (timerProgress / 100) * 502.65}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.5s, stroke 0.5s' }}
                      />
                    </svg>
                    <span className="absolute text-6xl font-extrabold font-mono z-20 select-none" style={{ color: getTimerColor(), textShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>{formatTime(timeRemaining)}</span>
                  </div>
                  {timerPaused ? (
                    <button 
                      onClick={resumeTimer}
                      className="btn-recipe-primary mt-2"
                    >
                      Resume Timer
                    </button>
                  ) : (
                    <button 
                      onClick={stopTimer}
                      className="btn-recipe-secondary mt-2"
                    >
                      Stop Timer
                    </button>
                  )}
                </>
              ) : (
                <button 
                  onClick={startTimer}
                  className="w-full btn-recipe-primary flex items-center justify-center gap-2 py-3"
                >
                  <Timer size={18} />
                  {timeRemaining > 0 
                    ? `Resume Timer (${formatTime(timeRemaining)})`
                    : `Start ${currentStep.timerMinutes} Minute Timer`}
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <div className="w-full max-w-3xl flex justify-between">
          <button
            onClick={goToPrevStep}
            disabled={currentStepIndex === 0}
            className="btn-recipe-secondary flex items-center gap-1 disabled:opacity-50"
          >
            <ChevronLeft size={18} />
            Previous Step
          </button>
          
          <button
            onClick={goToNextStep}
            disabled={currentStepIndex === recipe.steps.length - 1 || timerRunning}
            className={`btn-recipe-primary flex items-center gap-1 ${timerRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next Step
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
