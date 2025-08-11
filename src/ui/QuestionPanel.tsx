import React, { useState } from 'react';

type Question = {
  id: number;
  word: string;
  imageUrl: string;
  correctAnswer: number | string; // index of correct option or correct spelling
  explanation: string;
  isSpelling?: boolean; // Optional flag for spelling questions
};

type BlendingQuestion = {
  id: number;
  word: string;
  imageUrl: string;
  phonemes: string[]; // individual sounds for blending
  explanation: string;
};

type SpeechQuestion = {
  id: number;
  text: string;
  imageUrl: string;
  expectedWords: string[]; // words the student should say
  explanation: string;
};

type Props = {
  onComplete?: () => void;
};

export function QuestionPanel({ onComplete }: Props): JSX.Element {
  // Blending question data (first question)
  const blendingQuestions: BlendingQuestion[] = [
    {
      id: 1,
      word: "Asher",
      imageUrl: "🧑‍🚀", // Captain Asher
      phonemes: ["a", "sh", "er"], // special phoneme breakdown for Asher
      explanation: "Blend the sounds a-sh-er to make 'Asher'!"
    }
  ];

  // Speech question data
  const speechQuestions: SpeechQuestion[] = [
    {
      id: 1,
      text: "Map, please! Captain Asher and Clay were in the moon jungle. Shracker zipped overhead. The boss ran at Asher. Asher slid aside—WHOOSH! The boss fell into a spinning hole. A bright gate glowed. ‘Map, please,’ said Asher. The gate gave him a map.",
      imageUrl: "🗺️🚪✨🌙🌴", // Map, gate, sparkle, moon, jungle
      expectedWords: ["map", "gate"],
      explanation: "Great reading! You said the important words from the story."
    }
  ];

  // Question data
  const questions: Question[] = [
    {
      id: 1,
      word: "ship",
      imageUrl: "🚀", // Perfect single emoji for spaceship
      correctAnswer: 2, // "sh"
      explanation: 'Captain Asher flies his amazing space "ship" - it starts with "sh"!'
    },
    {
      id: 2,
      word: "chop",
      imageUrl: "🪓", // Axe emoji for chopping - SPELLING QUESTION
      isSpelling: true, // New flag to indicate this is a spelling question
      correctAnswer: "chop", // The correct spelling
      explanation: 'Clay uses his laser axe to "chop" jungle vines!'
    },
    // Removed questions 3 (think) and 4 (throw) per request
    {
      id: 5,
      word: "clay",
      imageUrl: "🐉", // Clay the MudWing dragon
      isSpelling: true,
      correctAnswer: "clay",
      explanation: 'Type the sidekick\'s name: Clay!'
    },
    {
      id: 6,
      word: "shracker",
      imageUrl: "🤖🐦", // Shracker the robot bird
      isSpelling: true,
      correctAnswer: "shracker",
      explanation: 'Type the robo-bird\'s name: Shracker!'
    }
  ];

  const options = ['th', 'ch', 'sh'];
  
  // Combined question management - start with blending question, then speech question, then regular questions
  const allQuestions = [...blendingQuestions, ...speechQuestions, ...questions];
  const totalQuestions = allQuestions.length;
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [spellingInput, setSpellingInput] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Speech-related state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [realtimeTranscript, setRealtimeTranscript] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  // Global speech state for toggle-able audio button
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  
  // Blending-related state
  const [blendingSoundOn, setBlendingSoundOn] = useState(true);
  const [currentPhonemeIndex, setCurrentPhonemeIndex] = useState(-1); // -1 means no highlight
  const [blendingTranscript, setBlendingTranscript] = useState<string>('');
  const [blendingRealtimeTranscript, setBlendingRealtimeTranscript] = useState<string>('');
  const [isBlendingRecording, setIsBlendingRecording] = useState(false);
  const [isBlendingProcessing, setIsBlendingProcessing] = useState(false);
  const [blendingAudioBlob, setBlendingAudioBlob] = useState<Blob | null>(null);
  const [blendingMediaRecorder, setBlendingMediaRecorder] = useState<MediaRecorder | null>(null);
  const [blendingRecognition, setBlendingRecognition] = useState<any>(null);
  
  // Determine current question type
  const isBlendingQuestion = currentQuestionIndex < blendingQuestions.length;
  const isSpeechQuestion = !isBlendingQuestion && currentQuestionIndex < blendingQuestions.length + speechQuestions.length;
  const currentBlendingQuestion = isBlendingQuestion ? blendingQuestions[currentQuestionIndex] : null;
  const currentSpeechQuestion = isSpeechQuestion ? speechQuestions[currentQuestionIndex - blendingQuestions.length] : null;
  const currentRegularQuestion = !isBlendingQuestion && !isSpeechQuestion ? questions[currentQuestionIndex - blendingQuestions.length - speechQuestions.length] : null;

  const handlePhonemeSound = (phoneme: string) => {
    // Play the sound of the individual phoneme
    if ('speechSynthesis' in window) {
      // Create proper phonetic pronunciation for specific phonemes
      let soundToPlay = phoneme;
      
      // Map phonemes to their actual sounds
      switch (phoneme.toLowerCase()) {
        case 'th':
          soundToPlay = 'thuh'; // The actual "th" sound like in "think"
          break;
        case 'ch':
          soundToPlay = 'chuh'; // The actual "ch" sound like in "chip"
          break;
        case 'sh':
          soundToPlay = 'sh'; // For this lesson, use plain "sh"
          break;
        // Individual letter sounds for blending
        case 's':
          soundToPlay = 'suhh'; // The "s" sound
          break;
        case 'a':
          soundToPlay = 'ack'; // Short "a" sound as in "sack"
          break;
        case 'er':
          soundToPlay = 'er';
          break;
        case 'ck':
          soundToPlay = 'kuh'; // "ck" digraph makes one "k" sound
          break;
        case 'c':
          soundToPlay = 'kuh'; // Hard "c" sound (same as k)
          break;
        case 'k':
          soundToPlay = 'kuh'; // The "k" sound
          break;
        case 'i':
          soundToPlay = 'e'; // Short "i" sound as in "kit"
          break;
        case 't':
          soundToPlay = 'tuh'; // The "t" sound
          break;
        default:
          soundToPlay = phoneme;
      }
      
      const utterance = new SpeechSynthesisUtterance(soundToPlay);
      utterance.rate = 0.5; // Even slower for clear phoneme pronunciation
      utterance.pitch = 1.1; // Slightly higher pitch for child-friendly sound
      utterance.volume = 0.9; // Clear volume for phoneme learning
      
      // Try to use a child-friendly voice if available
      const voices = window.speechSynthesis.getVoices();
      const childFriendlyVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('karen')
      );
      
      if (childFriendlyVoice) {
        utterance.voice = childFriendlyVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleOptionClick = (index: number) => {
    setSelectedOption(index);
    setShowFeedback(false); // Reset feedback when selecting new option
    
    // Play the phoneme sound when option is clicked
    const clickedPhoneme = options[index];
    if (clickedPhoneme) {
      handlePhonemeSound(clickedPhoneme);
    }
  };

  // Handle Hear button - play the complete word
  const handleHearWord = () => {
    if (!('speechSynthesis' in window)) return;
    // Toggle off if currently speaking
    if (window.speechSynthesis.speaking || isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    if (currentBlendingQuestion) {
      const utterance = new SpeechSynthesisUtterance(currentBlendingQuestion.word);
      utterance.rate = 0.8; // Clear pronunciation
      utterance.pitch = 1.1; // Child-friendly pitch
      utterance.volume = 0.9;

      const voices = window.speechSynthesis.getVoices();
      const childFriendlyVoice = voices.find(voice =>
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('karen')
      );
      if (childFriendlyVoice) utterance.voice = childFriendlyVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle Blend button - play individual phonemes with pauses and highlighting
  const handleBlendSounds = () => {
    if (currentBlendingQuestion && 'speechSynthesis' in window) {
      setCurrentPhonemeIndex(-1); // Reset highlighting
      
      currentBlendingQuestion.phonemes.forEach((phoneme, index) => {
        setTimeout(() => {
          setCurrentPhonemeIndex(index); // Highlight current letter
          handlePhonemeSound(phoneme);
          
          // Clear highlight after the sound finishes
          setTimeout(() => {
            if (index === currentBlendingQuestion.phonemes.length - 1) {
              setCurrentPhonemeIndex(-1); // Clear highlight after last sound
            }
          }, 600);
        }, index * 1000); // 1000ms delay between each sound for better timing
      });
    }
  };

  // Blending recording functions (similar to speech question)
  const startBlendingRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setBlendingAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        // Auto-process to simplify UI (no separate submit needed)
        processBlendingAudio(audioBlob);
      };

      setBlendingMediaRecorder(recorder);
      recorder.start();
      setIsBlendingRecording(true);
      setBlendingRealtimeTranscript('');
      setBlendingTranscript('');

      // Start real-time speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          setBlendingRealtimeTranscript(interimTranscript || finalTranscript);
        };
        
        recognition.onerror = (event: any) => {
          console.error('Blending speech recognition error:', event.error);
        };
        
        setBlendingRecognition(recognition);
        recognition.start();
      }
    } catch (error) {
      console.error('Error starting blending recording:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  const stopBlendingRecording = () => {
    if (blendingMediaRecorder && isBlendingRecording) {
      blendingMediaRecorder.stop();
      setIsBlendingRecording(false);
      
      if (blendingRecognition) {
        blendingRecognition.stop();
      }
    }
  };

  // Reset the blending session state so the learner can try again
  const resetBlendingSession = () => {
    if (isBlendingRecording) {
      stopBlendingRecording();
    }
    setBlendingTranscript('');
    setBlendingRealtimeTranscript('');
    setBlendingAudioBlob(null);
    setIsBlendingProcessing(false);
  };

  // Process blending audio (similar to speech question)
  const processBlendingAudio = async (blobOverride?: Blob) => {
    const blobToProcess = blobOverride || blendingAudioBlob;
    if (!blobToProcess) return;

    setIsBlendingProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', blobToProcess, 'blending_recording.wav');

      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[blending] Final transcript received:', data.transcript);
      setBlendingTranscript(data.transcript || '');
    } catch (error) {
      console.error('Error processing blending audio:', error);
      alert('Error processing audio. Please try again.');
    } finally {
      setIsBlendingProcessing(false);
    }
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        // Auto-process to simplify UI (no separate submit needed)
        processAudio(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setTranscript('');
      setRealtimeTranscript('');

      // Start real-time speech recognition
      startRealtimeSpeechRecognition();
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not start recording. Please check your microphone permissions.');
    }
  };

  const startRealtimeSpeechRecognition = () => {
    // Check if Web Speech API is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            currentTranscript += result[0].transcript + ' ';
          } else {
            currentTranscript += result[0].transcript;
          }
        }
        
        setRealtimeTranscript(currentTranscript.trim());
      };
      
      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
      };
      
      recognition.start();
      setSpeechRecognition(recognition);
    } else {
      console.warn('Web Speech API not supported in this browser');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
    
    // Stop real-time speech recognition
    if (speechRecognition) {
      speechRecognition.stop();
      setSpeechRecognition(null);
    }
  };

  const processAudio = async (blobOverride?: Blob) => {
    const blobToProcess = blobOverride || audioBlob;
    if (!blobToProcess) return;

    setIsProcessing(true);
    
    try {
      let finalTranscript = realtimeTranscript;
      
      // Always try to get a high-quality transcript from OpenAI Whisper for final evaluation
      console.log('Processing with OpenAI Whisper for final transcript...');
      const formData = new FormData();
      formData.append('audio', blobToProcess, 'recording.wav');

      // Use relative path for Vercel API routes
      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.transcript && result.transcript.trim().length > 0) {
          finalTranscript = result.transcript;
          setTranscript(finalTranscript);
          console.log('OpenAI Whisper transcript:', finalTranscript);
        } else {
          // Use real-time transcript if Whisper returned empty
          setTranscript(realtimeTranscript);
          console.log('Using real-time transcript as fallback:', realtimeTranscript);
        }
      } else {
        // Use real-time transcript if API call failed
        setTranscript(realtimeTranscript);
        console.log('API failed, using real-time transcript:', realtimeTranscript);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Error processing audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    if (isBlendingQuestion) {
      // For blending questions, always advance (no right/wrong)
      handleNextQuestion();
    } else if (currentRegularQuestion) {
      if (currentRegularQuestion.isSpelling) {
        // For spelling questions, check the input text
        const correct = spellingInput.toLowerCase().trim() === (currentRegularQuestion.correctAnswer as string).toLowerCase();
        setIsCorrect(correct);
        setShowFeedback(true);
      } else if (selectedOption !== null) {
        // For regular multiple choice questions, check the selected option
        const correct = selectedOption === currentRegularQuestion.correctAnswer;
        setIsCorrect(correct);
        setShowFeedback(true);
      }
    }
  };

  const handleTryAgain = () => {
    setSelectedOption(null);
    setSpellingInput('');
    setShowFeedback(false);
    setIsCorrect(false);
    // Reset speech-related state
    setAudioBlob(null);
    setTranscript('');
    setRealtimeTranscript('');
    setIsProcessing(false);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setSpellingInput('');
      setShowFeedback(false);
      setIsCorrect(false);
      // Reset speech-related state
      setAudioBlob(null);
      setTranscript('');
      setRealtimeTranscript('');
      setIsProcessing(false);
    } else {
      // All questions completed
      onComplete?.();
    }
  };

  // Global navigation: Next
  const handleNext = () => {
    // Stop any ongoing recordings to avoid dangling media tracks
    if (isRecording) {
      stopRecording();
    }
    if (isBlendingRecording) {
      stopBlendingRecording();
    }
    // Clear transient blending states
    setCurrentPhonemeIndex(-1);
    setBlendingTranscript('');
    setBlendingRealtimeTranscript('');
    setBlendingAudioBlob(null);

    handleNextQuestion();
  };

  // Global navigation: Previous
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex <= 0) return;
    if (isRecording) {
      stopRecording();
    }
    if (isBlendingRecording) {
      stopBlendingRecording();
    }
    setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
    setSelectedOption(null);
    setShowFeedback(false);
    setIsCorrect(false);
    // Reset speech-related state
    setAudioBlob(null);
    setTranscript('');
    setRealtimeTranscript('');
    setIsProcessing(false);
    // Reset blending-related state
    setCurrentPhonemeIndex(-1);
    setBlendingTranscript('');
    setBlendingRealtimeTranscript('');
    setBlendingAudioBlob(null);
  };

  const handleSoundClick = () => {
    if ('speechSynthesis' in window) {
      // Toggle off if currently speaking
      if (window.speechSynthesis.speaking || isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      let textToSpeak = '';
      if (isBlendingQuestion && currentBlendingQuestion) {
        textToSpeak = currentBlendingQuestion.word;
      } else if (isSpeechQuestion && currentSpeechQuestion) {
        textToSpeak = currentSpeechQuestion.text;
      } else if (!isSpeechQuestion && !isBlendingQuestion && currentRegularQuestion) {
        textToSpeak = currentRegularQuestion.word;
      }

      if (textToSpeak) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = isSpeechQuestion ? 0.8 : 0.7; // Slightly faster for longer text
        utterance.pitch = 1.1; // Child-friendly pitch

        const voices = window.speechSynthesis.getVoices();
        const childFriendlyVoice = voices.find(voice =>
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('samantha') ||
          voice.name.toLowerCase().includes('karen')
        );
        if (childFriendlyVoice) utterance.voice = childFriendlyVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f3e9ff 0%, #efe3ff 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative'
    }}>
      {/* Progress indicator */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '16px',
        padding: '9.6px 16px',
        fontSize: '12.8px',
        fontWeight: '600',
        color: '#374151',
        boxShadow: '0 3.2px 9.6px rgba(0,0,0,0.1)'
      }}>
        Question {currentQuestionIndex + 1} of {totalQuestions}
      </div>
      {/* Content area - different layouts for blending, speech vs regular questions */}
      {isBlendingQuestion && currentBlendingQuestion ? (
        <>
          {/* Blending Question Layout */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: '19.2px',
            width: 'min(896px, 92vw)',
            margin: '0 auto'
          }}>
            {/* Top controls - center aligned: Hear, Blend, Toggle */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12.8px',
              width: '100%',
              marginBottom: '6.4px',
              padding: '0 6.4px'
            }}>
              {/* Hear and Blend buttons */}
              <div style={{
                display: 'flex',
                gap: '12.8px'
              }}>
                <button
                  onClick={handleHearWord}
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '11.2px',
                    padding: '9.6px 19.2px',
                    fontSize: '12.8px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4.8px',
                    boxShadow: '0 4.8px 16px rgba(139, 92, 246, 0.25)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.95)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  🔊 Hear
                </button>
                
                <button
                  onClick={handleBlendSounds}
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '11.2px',
                    padding: '9.6px 19.2px',
                    fontSize: '12.8px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4.8px',
                    boxShadow: '0 4.8px 16px rgba(139, 92, 246, 0.25)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.95)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Blend
                </button>
              </div>

              {/* Blending Sound toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <button
                  onClick={() => setBlendingSoundOn(!blendingSoundOn)}
                  style={{
                    width: '41.6px',
                    height: '20.8px',
                    borderRadius: '10.4px',
                    border: 'none',
                    background: blendingSoundOn ? '#8b5cf6' : '#d1d5db',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    width: '17.6px',
                    height: '17.6px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '1.6px',
                    left: blendingSoundOn ? '22.4px' : '1.6px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </button>
                <span style={{
                  fontSize: '11.2px',
                  fontWeight: '600',
                  color: '#6b7280'
                }}>
                  Blending Sound {blendingSoundOn ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>

            {/* Word display */}
            <div style={{
              background: '#fdfbff',
              borderRadius: '32px',
              padding: '64px 76.8px',
              boxShadow: '9.6px 14.4px 0 rgba(156, 126, 172, 0.25), 0 22.4px 64px rgba(0,0,0,0.08)',
              textAlign: 'center',
              width: 'min(640px, 92vw)',
              margin: '0 auto',
              minHeight: '288px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {/* Individual letters with highlighting */}
              <div style={{
                display: 'flex',
                gap: '9.6px',
                marginBottom: '24px',
                alignItems: 'center'
              }}>
                {currentBlendingQuestion.phonemes.map((phoneme, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '9.6px'
                  }}>
                    {/* Phoneme (letter or digraph) */}
                    <div style={{
                      fontSize: '120px',
                      fontWeight: '800',
                      color: currentPhonemeIndex === index ? '#8b5cf6' : '#111827',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      transition: 'color 0.3s ease',
                      textShadow: currentPhonemeIndex === index ? '0 0 12.8px rgba(139, 92, 246, 0.45)' : 'none'
                    }}>
                      {phoneme}
                    </div>
                    {/* Dot positioned under each letter */}
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: currentPhonemeIndex === index ? '#8b5cf6' : '#c084fc',
                      transition: 'all 0.3s ease',
                      transform: currentPhonemeIndex === index ? 'scale(1.25)' : 'scale(1)'
                    }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Speech Recognition Section - simplified */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '19.2px',
              padding: '25.6px',
              boxShadow: '0 6.4px 25.6px rgba(0,0,0,0.08)',
              border: '1px solid rgba(139, 92, 246, 0.1)',
              width: 'min(640px, 92vw)',
              margin: '19.2px auto 0',
              textAlign: 'center'
            }}>
              {/* Header */}
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#374151',
                margin: '0 0 19.2px 0'
              }}>
                Now say the word 3 times
              </h3>

              {/* Microphone */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12.8px',
                marginBottom: '19.2px'
              }}>
                <button
                  onClick={isBlendingRecording ? stopBlendingRecording : startBlendingRecording}
                  disabled={isBlendingProcessing}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: isBlendingProcessing
                      ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                      : isBlendingRecording 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    cursor: isBlendingProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isBlendingRecording 
                      ? '0 6.4px 19.2px rgba(239, 68, 68, 0.3)' 
                      : '0 6.4px 19.2px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseDown={(e) => {
                    if (!isBlendingProcessing) e.currentTarget.style.transform = 'scale(0.95)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {isBlendingProcessing ? (
                    // Processing spinner
                    <div style={{
                      width: '19.2px',
                      height: '19.2px',
                      border: '3px solid rgba(255,255,255,0.3)',
                      borderTop: '3px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  ) : isBlendingRecording ? (
                    // Stop icon
                    <div style={{
                      width: '16px',
                      height: '16px',
                      background: 'white',
                      borderRadius: '3px'
                    }} />
                  ) : (
                    // Microphone icon
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                        fill="white"
                      />
                      <path
                        d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                        fill="white"
                      />
                    </svg>
                  )}
                  
                  {/* Recording animation */}
                  {isBlendingRecording && (
                    <div style={{
                      position: 'absolute',
                      inset: '-6.4px',
                      border: '3px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '50%',
                      animation: 'pulse 1.5s infinite'
                    }} />
                  )}
                </button>

                {/* Status text */}
                {(isBlendingProcessing || isBlendingRecording) && (
                  <div style={{
                    fontSize: '11.2px',
                    fontWeight: '600',
                    color: isBlendingRecording ? '#ef4444' : '#6b7280'
                  }}>
                    {isBlendingProcessing 
                      ? 'Processing...' 
                      : '🔴 Recording... Click to stop'}
                  </div>
                )}
              </div>

              {/* Final result only - no live transcript */}
              {blendingTranscript && !isBlendingRecording && (
                <div style={{
                  padding: '16px 19.2px',
                  background: blendingTranscript.toLowerCase().includes(currentBlendingQuestion?.word.toLowerCase() || '')
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  borderRadius: '12.8px',
                  fontSize: '12.8px',
                  fontWeight: '600',
                  boxShadow: '0 6.4px 20px rgba(0,0,0,0.15)',
                  lineHeight: '1.5',
                  marginBottom: '19.2px'
                }}>
                  <div style={{
                    fontWeight: '700',
                    marginBottom: '9.6px',
                    fontSize: '11.2px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    opacity: 0.9
                  }}>
                    {blendingTranscript.toLowerCase().includes(currentBlendingQuestion?.word.toLowerCase() || '') ? '🎯 Final Result' : '🔄 Final Result'}
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '9.6px 12.8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    fontSize: '12.8px',
                    fontWeight: '500'
                  }}>
                    "{blendingTranscript}"
                  </div>
                </div>
              )}

              {/* Action buttons - only show when we have a result */}
              {!isBlendingRecording && (blendingTranscript || blendingAudioBlob) && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '12.8px'
                }}>
                  <button
                    onClick={resetBlendingSession}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'scale(0.95)';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    🔁 Try Again
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'scale(0.95)';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    ✨ Continue
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : isSpeechQuestion && currentSpeechQuestion ? (
        <>
          {/* Speech Question Layout - Wrapper Container */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '32px',
            width: '100%',
            maxWidth: '960px',
            margin: '0 auto'
          }}>
            {/* Top section with audio button and main content */}
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '640px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Audio button positioned to the left, not affecting layout width */}
              <button
                onClick={handleSoundClick}
                style={{
                  position: 'absolute',
                  left: '-112px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '80px',
                  height: '80px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6.4px 19.2px rgba(139, 92, 246, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(0.95)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                {/* Sound icon */}
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                    fill="white"
                  />
                </svg>
              </button>

              {/* Main content container - similar to question 1's sack container */}
              <div id="speech-main-container" style={{
                background: '#fdfbff',
                borderRadius: '32px',
                padding: '40px 48px',
                boxShadow: '9.6px 14.4px 0 rgba(156, 126, 172, 0.25), 0 22.4px 64px rgba(0,0,0,0.08)',
                textAlign: 'center',
                maxWidth: '640px',
                minHeight: '256px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '24px'
              }}>
                {/* Story text - directly in white container */}
                <div style={{
                  fontSize: '17.6px',
                  lineHeight: '1.7',
                  color: '#1f2937',
                  fontWeight: '600',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  textAlign: 'center'
                }}>
                  {currentSpeechQuestion.text}
                </div>

                {/* Story emojis - integrated below the text */}
                <div style={{
                  fontSize: '64px',
                  letterSpacing: '6.4px',
                  textShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))'
                }}>
                  {currentSpeechQuestion.imageUrl}
                </div>
              </div>
            </div>

            {/* Recording section - aligned to main container */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '19.2px',
              padding: '25.6px',
              boxShadow: '0 6.4px 25.6px rgba(0,0,0,0.08)',
              border: '1px solid rgba(139, 92, 246, 0.1)',
              width: '100%',
              maxWidth: '640px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              {/* Header */}
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#374151',
                margin: '0 0 24px 0'
              }}>
                Now read the story back to me
              </h3>

              {/* Microphone */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                marginBottom: '24px',
                width: '100%'
              }}>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: isProcessing
                      ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                      : isRecording 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isRecording 
                      ? '0 8px 24px rgba(239, 68, 68, 0.3)' 
                      : '0 8px 24px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseDown={(e) => {
                    if (!isProcessing) e.currentTarget.style.transform = 'scale(0.95)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {isProcessing ? (
                    // Processing spinner
                    <div style={{
                      width: '24px',
                      height: '24px',
                      border: '3px solid rgba(255,255,255,0.3)',
                      borderTop: '3px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  ) : isRecording ? (
                    // Stop icon
                    <div style={{
                      width: '20px',
                      height: '20px',
                      background: 'white',
                      borderRadius: '3px'
                    }} />
                  ) : (
                    // Microphone icon
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                        fill="white"
                      />
                      <path
                        d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                        fill="white"
                      />
                    </svg>
                  )}
                  
                  {/* Recording animation */}
                  {isRecording && (
                    <div style={{
                      position: 'absolute',
                      inset: '-8px',
                      border: '3px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '50%',
                      animation: 'pulse 1.5s infinite'
                    }} />
                  )}
                </button>

                {/* Status text */}
                {(isProcessing || isRecording) && (
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: isRecording ? '#ef4444' : '#6b7280'
                  }}>
                    {isProcessing 
                      ? 'Processing...' 
                      : '🔴 Recording... Click to stop'}
                  </div>
                )}
              </div>

              {/* Live transcript display */}
              {realtimeTranscript && isRecording && (
                <div style={{
                  padding: '20px 24px',
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  color: '#065f46',
                  borderRadius: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  lineHeight: '1.5',
                  marginBottom: '24px',
                  border: '2px solid #10b981',
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: '500px'
                }}>
                  <div style={{
                    fontWeight: '700',
                    marginBottom: '12px',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    opacity: 0.9,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ color: '#ef4444' }}>🔴</span>
                    Live Transcript
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.7)',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#1f2937'
                  }}>
                    "{realtimeTranscript}"
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#047857',
                    marginTop: '8px',
                    fontStyle: 'italic'
                  }}>
                    Keep speaking... I'm listening! 👂
                  </div>
                </div>
              )}

              {/* Final result - only show when we have a result */}
              {transcript && !isRecording && (
                <div style={{
                  padding: '20px 24px',
                  background: (transcript.toLowerCase().includes('map') || transcript.toLowerCase().includes('gate'))
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  borderRadius: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  lineHeight: '1.5',
                  marginBottom: '24px',
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: '500px'
                }}>
                  <div style={{
                    fontWeight: '700',
                    marginBottom: '12px',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    opacity: 0.9
                  }}>
                    {(transcript.toLowerCase().includes('map') || transcript.toLowerCase().includes('gate')) ? '🎯 Final Result' : '🔄 Final Result'}
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}>
                    "{transcript}"
                  </div>
                </div>
              )}

              {/* Action buttons - only show when we have a result */}
              {!isRecording && transcript && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '16px',
                  width: '100%'
                }}>
                  <button
                    onClick={() => {
                      setTranscript('');
                      setRealtimeTranscript('');
                      setAudioBlob(null);
                      setIsProcessing(false);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'scale(0.95)';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    🔁 Try Again
                  </button>
                  {/* Only show continue button if transcript contains key words */}
                  {(transcript.toLowerCase().includes('map') || transcript.toLowerCase().includes('gate')) && (
                    <button
                      onClick={handleNextQuestion}
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '14px',
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'scale(0.95)';
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      ✨ Continue
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Regular Question Prompt - moved above image */}
          {!isBlendingQuestion && !isSpeechQuestion && (
            <div style={{
              textAlign: 'center',
              marginBottom: '12.8px',
              padding: '12.8px',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '16px',
              boxShadow: '0 3.2px 9.6px rgba(0,0,0,0.1)',
              maxWidth: '520px',
              margin: '0 auto 12.8px'
            }}>
              <div style={{
                fontSize: '19.2px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '4.8px'
              }}>
                🎧 Listen to Captain Asher's word!
              </div>
              <div style={{
                fontSize: '14.4px',
                color: '#6b7280',
                fontWeight: '500',
              }}>
                What sound does it start with?
              </div>
            </div>
          )}

          {/* Regular Question Layout */}
          <div style={{
            marginBottom: '32px',
            position: 'relative',
            borderRadius: '16px',
            overflow: 'visible',
            boxShadow: '0 6.4px 25.6px rgba(0,0,0,0.15)'
          }}>
            {currentRegularQuestion && (
              <div style={{
                width: '320px',
                height: '224px',
                position: 'relative',
                margin: '0 auto'
              }}>
                {/* Speaker button to the left of image */}
                <button
                  onClick={handleSoundClick}
                  style={{
                    position: 'absolute',
                    left: '-96px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6.4px 19.2px rgba(139, 92, 246, 0.35)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(0.95)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="white"/>
                  </svg>
                </button>

                {/* Image container */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
                  border: '3.2px solid #8b5cf6',
                  borderRadius: '16px',
                  fontSize: '112px',
                  letterSpacing: '3.2px',
                  boxShadow: '0 6.4px 25.6px rgba(139, 92, 246, 0.3), inset 0 1.6px 3.2px rgba(255,255,255,0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 30% 20%, rgba(139, 92, 246, 0.25) 0%, transparent 50%)',
                    animation: 'pulse 3s ease-in-out infinite'
                  }} />
                  <div style={{ position: 'relative', zIndex: 1, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                    {currentRegularQuestion.imageUrl}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Answer interface for regular questions */}
          {!isBlendingQuestion && !isSpeechQuestion && currentRegularQuestion && (
            <div style={{ marginTop: '12px' }}>
              {currentRegularQuestion.isSpelling ? (
                /* Spelling input interface (dynamic length) */
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px'
                }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#374151',
                    textAlign: 'center'
                  }}>
                    🎯 Type the word you hear:
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                  }}>
                    {Array.from({ length: (currentRegularQuestion.correctAnswer as string).length }).map((_, index) => (
                      <input
                        key={index}
                        type="text"
                        aria-label={`Letter ${index + 1}`}
                        maxLength={1}
                        value={spellingInput[index] || ''}
                        onChange={(e) => {
                          const newInput = spellingInput.split('');
                          newInput[index] = e.target.value.toLowerCase();
                          setSpellingInput(newInput.join(''));
                          // Auto-focus next input
                          if (e.target.value && index < (currentRegularQuestion.correctAnswer as string).length - 1) {
                            const nextInput = e.currentTarget.parentElement?.children[index + 1] as HTMLInputElement;
                            nextInput?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
                            const prevInput = e.currentTarget.parentElement?.children[index - 1] as HTMLInputElement;
                            prevInput?.focus();
                          }
                        }}
                        style={{
                          width: '48px',
                          height: '56px',
                          fontSize: '22px',
                          fontWeight: '700',
                          textAlign: 'center',
                          border: '3px solid #e0e0e0',
                          borderRadius: '10px',
                          background: 'white',
                          color: '#374151',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.border = '3px solid #8b5cf6';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.border = '3px solid #e0e0e0';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                /* Multiple choice interface */
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '19.2px'
                }}>
                  {options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionClick(index)}
                      style={{
                        minWidth: '96px',
                        height: '64px',
                        borderRadius: '16px',
                        background: selectedOption === index 
                          ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                          : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                        border: selectedOption === index ? '2.4px solid #7c3aed' : '2.4px solid #e0e0e0',
                        cursor: 'pointer',
                        fontSize: '25.6px',
                        fontWeight: '700',
                        color: selectedOption === index ? 'white' : '#424242',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: selectedOption === index 
                          ? '0 6.4px 19.2px rgba(124, 58, 237, 0.35)'
                          : '0 3.2px 9.6px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'scale(0.95)';
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Question prompt - only show for regular questions, not blending or speech */}
      {/* Removed duplicate prompt (now shown above image) */}

      {/* Submit button - only for regular questions */}
      {!isSpeechQuestion && !isBlendingQuestion && !showFeedback && currentRegularQuestion && (
        (currentRegularQuestion.isSpelling 
          ? spellingInput.length >= Math.min(3, (currentRegularQuestion.correctAnswer as string).length)
          : selectedOption !== null)
      ) && (
        <div style={{
          marginTop: '32px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={handleSubmit}
            style={{
              minWidth: '128px',
              height: '48px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '700',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6.4px 19.2px rgba(79, 70, 229, 0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Submit
          </button>
        </div>
      )}

      {/* Feedback section - only for regular questions */}
      {!isSpeechQuestion && showFeedback && (
        <div style={{
          marginTop: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          {/* Combined feedback + explanation container */}
          <div style={{
            padding: '24px 28px',
            borderRadius: '20px',
            background: isCorrect 
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            textAlign: 'center',
            boxShadow: isCorrect 
              ? '0 8px 24px rgba(16, 185, 129, 0.3)'
              : '0 8px 24px rgba(239, 68, 68, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '760px'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '800'
            }}>
              {isCorrect ? '🎉 Correct! Well done!' : '❌ Not quite right. Try again!'}
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '14px 18px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.35)',
              fontSize: '18px',
              fontWeight: 600,
              lineHeight: 1.5,
              width: '100%'
            }}>
              {isCorrect 
                ? (currentRegularQuestion?.explanation || 'Great job!')
                : (currentRegularQuestion?.isSpelling 
                    ? 'Listen to the word and try spelling it again.'
                    : `Listen to the word "${currentRegularQuestion?.word || 'this word'}" again. What sound do you hear at the beginning?`)}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{
            display: 'flex',
            gap: '16px'
          }}>
            {!isCorrect && (
              <button
                onClick={handleTryAgain}
                style={{
                  minWidth: '140px',
                  height: '50px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'white',
                  boxShadow: '0 6px 20px rgba(245, 158, 11, 0.3)',
                  transition: 'all 0.2s ease',
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Try Again
              </button>
            )}

            {isCorrect && (
              <button
                onClick={handleNextQuestion}
                style={{
                  minWidth: '140px',
                  height: '50px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'white',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {currentQuestionIndex < totalQuestions - 1 ? '➡️ Next Question' : '🎉 Complete!'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Global navigation - bottom right */}
      <div style={{ position: 'absolute', bottom: '16px', right: '16px', display: 'flex', gap: '9.6px', zIndex: 10 }}>
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          style={{
            minWidth: '96px',
            height: '38.4px',
            borderRadius: '12.8px',
            background: 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)',
            color: '#374151',
            border: 'none',
            cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
            fontSize: '12.8px',
            fontWeight: 700,
            boxShadow: '0 6.4px 19.2px rgba(156,163,175,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6.4px',
            opacity: currentQuestionIndex === 0 ? 0.6 : 1
          }}
          onMouseDown={(e) => {
            if (currentQuestionIndex !== 0) e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title={currentQuestionIndex === 0 ? 'No previous question' : 'Go to previous question'}
          aria-label="Previous question"
        >
          ⬅️ Previous
        </button>
        <button
          onClick={handleNext}
          style={{
            minWidth: '96px',
            height: '38.4px',
            borderRadius: '12.8px',
            background: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12.8px',
            fontWeight: 700,
            boxShadow: '0 6.4px 19.2px rgba(107,114,128,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6.4px'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Next question"
          aria-label="Next question"
        >
          Next ➡️
        </button>
      </div>
    </div>
  );
}
