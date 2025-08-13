import React, { useEffect, useRef, useState } from 'react';
import bg1Url from '../../bg1.png';
import { Question, BlendingQuestion, SpeechQuestion } from './questions/types';
import { blendingQuestions as blendingQuestionsData, speechQuestions as speechQuestionsData, questions as regularQuestionsData, options } from './questions/data';
import { AdventureMode } from './questions/AdventureMode';

// Simple global audio manager to prevent overlapping audio
const audioManager = (() => {
  let activeAudio: HTMLAudioElement | null = null;
  return {
    stopAll: () => {
      try { if (activeAudio) { activeAudio.pause(); activeAudio.currentTime = 0; } } catch {}
      activeAudio = null;
      try { window.speechSynthesis?.cancel(); } catch {}
    },
    setActive: (el: HTMLAudioElement | null) => { activeAudio = el; },
    getActive: () => activeAudio
  };
})();

type Props = {
  onComplete?: () => void;
};

export function QuestionPanel({ onComplete }: Props): JSX.Element {
  // Blending question data (first question)
  const blendingQuestions: BlendingQuestion[] = blendingQuestionsData;

  // Speech question data
  const speechQuestions: SpeechQuestion[] = speechQuestionsData;

  // Question data
  const questions: Question[] = regularQuestionsData;
  
  // Flow order: adventure mode (step 1) -> blending -> speech -> adventure mode (step 4) -> regular questions -> adventure mode (step 9)
  const totalSteps = 1 + blendingQuestions.length + speechQuestions.length + 1 + questions.length + 1;
  
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
  // Story continuation experiment state
  const [storyContext, setStoryContext] = useState<string[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
  const [isSummarySpeaking, setIsSummarySpeaking] = useState<boolean>(false);
  const summaryAudioRef = useRef<HTMLAudioElement | null>(null);
  const [hasAutoplayedSummary, setHasAutoplayedSummary] = useState<boolean>(false);
  const [hasGeneratedSummary, setHasGeneratedSummary] = useState<boolean>(false);
  const [summaryRefreshCount, setSummaryRefreshCount] = useState<number>(0);
  const [continuationInput, setContinuationInput] = useState<string>('');
  const [validationMessage, setValidationMessage] = useState<string>(''); // AI 1-2 word reply
  const [validatedContinuation, setValidatedContinuation] = useState<string>(''); // shows as user bubble
  // Voice capture for continuation (lightweight Web Speech API)
  const [isContRecording, setIsContRecording] = useState<boolean>(false);
  const [contRecognition, setContRecognition] = useState<any>(null);
  const [contMediaRecorder, setContMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isContProcessing, setIsContProcessing] = useState<boolean>(false);
  const [isContinuationAnimating, setIsContinuationAnimating] = useState<boolean>(false);
  const [isContinuationHidden, setIsContinuationHidden] = useState<boolean>(false);
  const [isFeedbackRemoved, setIsFeedbackRemoved] = useState<boolean>(false);
  const [hasAutoplayedContPrompt, setHasAutoplayedContPrompt] = useState<boolean>(false);
  // Dynamic header shown in the green container during continuation (CTA or AI help lines)
  const [continuationHeader, setContinuationHeader] = useState<string>('');
  
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
  
  // Determine current step type
  const isAdventureMode1 = currentQuestionIndex === 0;
  const isBlendingQuestion = currentQuestionIndex >= 1 && currentQuestionIndex < 1 + blendingQuestions.length;
  const isSpeechQuestion = currentQuestionIndex >= 1 + blendingQuestions.length && currentQuestionIndex < 1 + blendingQuestions.length + speechQuestions.length;
  const isAdventureMode4 = currentQuestionIndex === (1 + blendingQuestions.length + speechQuestions.length);
  const isAdventureMode9 = currentQuestionIndex === (1 + blendingQuestions.length + speechQuestions.length + 1 + questions.length);
  const isAdventureMode = isAdventureMode1 || isAdventureMode4 || isAdventureMode9;
  const currentBlendingQuestion = isBlendingQuestion ? blendingQuestions[currentQuestionIndex - 1] : null;
  const currentSpeechQuestion = isSpeechQuestion ? speechQuestions[currentQuestionIndex - 1 - blendingQuestions.length] : null;
  const currentRegularQuestion = (!isBlendingQuestion && !isSpeechQuestion && !isAdventureMode)
    ? questions[currentQuestionIndex - 1 - blendingQuestions.length - speechQuestions.length - 1]
    : null;
  // Continuation experiment flags (now data-driven via aiHook)
  const isFirstRegularStep = (!isBlendingQuestion && !isSpeechQuestion && !isAdventureMode && currentRegularQuestion?.id === 1);
  const isSecondRegularStep = (!isBlendingQuestion && !isSpeechQuestion && !isAdventureMode && currentRegularQuestion?.id === 2);
  const isAiHookStep = !!currentRegularQuestion?.aiHook;
  const isContinuationStep = isAiHookStep;

  // AI hook config (data-driven) with safe fallbacks to preserve current behavior
  const aiCfg = currentRegularQuestion?.aiHook;
  const hookTargetWord = aiCfg?.targetWord || (isSecondRegularStep ? 'chop' : (isFirstRegularStep ? 'ship' : (currentRegularQuestion?.word || '')));
  const hookQuestionLine = aiCfg?.questionLine || (isFirstRegularStep ? 'What sound does it start with?' : 'What is that word?');
  const hookBaseLine = aiCfg?.baseLine || (isFirstRegularStep
    ? 'Across the water, something big glides toward Captain Asher.'
    : 'From the vines, you hear a steady cutting sound ahead.');
  const hookValidationWord = aiCfg?.validationWord || (isSecondRegularStep ? 'chop' : 'ship');
  const hookIntent = aiCfg?.intent || (isFirstRegularStep ? 'sound' : 'spelling');

  // Context helpers (centralized, but preserving existing behavior)
  const buildContextText = (): string => {
    return storyContext.join('\n');
  };
  const getLastEvent = (): string => {
    if (isSecondRegularStep && validatedContinuation) return validatedContinuation;
    return storyContext[storyContext.length - 1] || '';
  };

  // (Adventure mode state moved into AdventureMode component)

  // (Adventure mode auto-scroll handled in AdventureMode)

  // (Adventure mode audio setup handled in AdventureMode)

  // (Adventure mode auto-play handled in AdventureMode)

  // (Adventure image generation handled in AdventureMode)

  // (Adventure TTS handled in AdventureMode)

  // (Adventure messaging handled in AdventureMode)

  // (Adventure mic handling moved into AdventureMode)

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

  // Seed story context with the speech story (step 2) once
  useEffect(() => {
    const firstSpeech = speechQuestions && speechQuestions.length > 0 ? speechQuestions[0] : undefined;
    if (storyContext.length === 0 && firstSpeech && firstSpeech.text) {
      setStoryContext([firstSpeech.text]);
    }
  }, [speechQuestions, storyContext.length]);

  // Reset AI hook state when entering a hook step (4 or 5) to force regeneration
  useEffect(() => {
    if (isAiHookStep) {
      setHasGeneratedSummary(false);
      setHasAutoplayedSummary(false);
      setAiSummary('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAiHookStep, currentRegularQuestion?.id]);

  // Preserve the learner's validated continuation when returning to Step 4 later
  useEffect(() => {
    if (isFirstRegularStep && validatedContinuation) {
      setShowFeedback(true);
      setIsCorrect(true);
      setIsContinuationHidden(true);
      setIsFeedbackRemoved(false);
    }
  }, [isFirstRegularStep, validatedContinuation]);

  // Generate a brief story-forwarding hook (short sentences) when step 4/5 is active, only once unless retried
  useEffect(() => {
    const shouldSummarize = isAiHookStep && storyContext.length > 0 && !hasGeneratedSummary;
    if (!shouldSummarize) return;
    let cancelled = false;
    const run = async () => {
      try {
        setIsSummaryLoading(true);
        const targetWord = hookTargetWord;
        const lastEvent = getLastEvent();
        const questionEnding = hookQuestionLine;
        const baseLine = hookBaseLine;
        const contextText = buildContextText();
        const messages = [
          {
            role: 'system',
            content:
              'You are a playful kids narrator for early readers. Make it fun and spoken to Asher (the player). Write 1–2 VERY SHORT sentences using simple K–2 words. CRITICAL RULE: If the target word is a character name (Clay, Shracker), do NOT have that character speak or introduce themselves. Use the OTHER character instead. Pattern: 1) A character notices the action. 2) Shracker gives Asher a friendly clue. If this step corresponds to "What is that word?", BEGIN with a tiny bridge (3–6 words) that naturally connects to the previous event. Adapt the base line to match the setting and use lively action/sound words. IMPORTANT: Do NOT include the provided question line; fold the task into Shracker\'s instruction to Asher. The UNSEEN target must matter next. STRICT RULES: Do NOT name, spell, rhyme, define, hint letters for, or use synonyms/descriptions of the target. If target is "clay", have Shracker speak, not Clay. If target is "shracker", have Clay speak, not Shracker. Return only the message.'
          },
          {
            role: 'user',
            content: `Current adventure history (most recent last):\n${contextText}\n\nMost recent event to bridge from:\n${lastEvent}\n\nTarget word for the next question: ${targetWord}\n\nBase line to adapt: ${baseLine}\n\nCRITICAL: If target word is "${targetWord}" and it's a character name, do NOT have that character speak! If target is "clay", only Shracker speaks. If target is "shracker", only Clay speaks.\n\nQuestion line (for reference only, do NOT output it verbatim): ${questionEnding}\n\nInstruction mapping: Always have the NON-TARGET character give the clue to Asher.`
          }
        ];
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages })
        });
        const data = await res.json();
        if (!cancelled) {
          setAiSummary(
            data.reply || (isFirstRegularStep
              ? '"Oh look! Something big glides over the waves," says Clay. "Here\'s a clue, Asher: spot it and select the sound it starts with," says Shracker.'
              : '"Listen! A steady cutting sound comes from the vines," says Clay. "Here\'s a clue, Asher: name it and type the word," says Shracker.')
          );
          setHasGeneratedSummary(true);
        }
      } catch {
        if (!cancelled) {
          setAiSummary(isFirstRegularStep
            ? '"Oh look! Something big glides over the waves," says Clay. "Here\'s a clue, Asher: spot it and select the sound it starts with," says Shracker.'
            : '"Listen! A steady cutting sound comes from the vines," says Clay. "Here\'s a clue, Asher: name it and type the word," says Shracker.');
          setHasGeneratedSummary(true);
        }
      } finally {
        if (!cancelled) setIsSummaryLoading(false);
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [isAiHookStep, isFirstRegularStep, hasGeneratedSummary, storyContext, validatedContinuation, isSecondRegularStep, hookTargetWord, hookQuestionLine, hookBaseLine]);

  // Helper: ElevenLabs TTS
  const playElevenTTS = async (text: string, voiceId?: string): Promise<HTMLAudioElement | null> => {
    try {
      // Always preempt any current audio before starting new
      audioManager.stopAll();
      const res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice_id: voiceId })
      });
      if (!res.ok) return null;
      const data = await res.json();
      const audio = new Audio(data.audioUrl as string);
      audioManager.setActive(audio);
      await audio.play().catch(() => undefined);
      return audio;
    } catch {
      return null;
    }
  };

  const handleSummaryAudio = async () => {
    if (!aiSummary) return;
    // Toggle: stop existing audio
    if (summaryAudioRef.current && !summaryAudioRef.current.paused) {
      try { summaryAudioRef.current.pause(); summaryAudioRef.current.currentTime = 0; } catch {}
      setIsSummarySpeaking(false);
      return;
    }
    // Preempt any other audio before playing
    audioManager.stopAll();
    const textToSpeak = aiSummary.trim();
    setIsSummarySpeaking(true);
    const audio = await playElevenTTS(textToSpeak);
    if (audio) {
      summaryAudioRef.current = audio;
      audio.onended = () => setIsSummarySpeaking(false);
      audio.onerror = () => setIsSummarySpeaking(false);
    } else {
      setIsSummarySpeaking(false);
    }
  };

  // When the continuation step becomes active (after correct answer), seed the header text
  useEffect(() => {
    if (isCorrect && isContinuationStep) {
      const defaultLine = isFirstRegularStep
        ? `Yay, "${hookTargetWord}" it is. What will you do with this ${hookTargetWord}? Let\'s include it in your story`
        : `Awesome, let\'s keep the story going. Include the word "${hookTargetWord}" in what happens next!`;
      setContinuationHeader(defaultLine);
    }
  }, [isCorrect, isContinuationStep, isFirstRegularStep]);

  // Autoplay the continuation guidance once when the prompt row mounts (Step 4 & 5)
  useEffect(() => {
    if (isCorrect && isContinuationStep && !isContinuationHidden && !hasAutoplayedContPrompt) {
      setHasAutoplayedContPrompt(true);
      audioManager.stopAll();
      const line = (continuationHeader || (isFirstRegularStep
        ? `Yay, "${hookTargetWord}" it is. What will you do with this ${hookTargetWord}? Let\'s include it in your story`
        : `Awesome, let\'s keep the story going. Include the word "${hookTargetWord}" in what happens next!`));
      void playElevenTTS(line);
    }
  }, [isCorrect, isContinuationStep, isFirstRegularStep, isContinuationHidden, hasAutoplayedContPrompt, continuationHeader]);

  // Step 0: On entering Step 4, stop any ongoing audio and autoplay summary
  useEffect(() => {
    if (isFirstRegularStep && aiSummary && !hasAutoplayedSummary) {
      audioManager.stopAll();
      const run = async () => {
        const textToSpeak = aiSummary.trim();
        await playElevenTTS(textToSpeak);
        setHasAutoplayedSummary(true);
      };
      void run();
    }
  }, [isFirstRegularStep, aiSummary, hasAutoplayedSummary]);

  // Evaluate continuation via AI with richer outcomes
  type ContinuationEval = { status: 'valid' | 'invalid' | 'help'; message: string };
  const validateContinuationWithAI = async (text: string): Promise<ContinuationEval> => {
    try {
      const targetWord = hookValidationWord;
      const messages = [
        { role: 'system', content: `You are Captain Asher's fun AI companion helping kids write their adventure story. Your job is to check if they used the target word "${targetWord}" in their sentence and respond naturally like a friendly narrator. 

Respond as minified JSON: {"status":"valid|invalid|help","message":"<your response>"}

RULES:
- "valid": Only if the EXACT word "${targetWord}" appears as a standalone word (case-insensitive). Say something encouraging like "Perfect!" or "Great use of ${targetWord}!" 
- "invalid": If they used a different word or misspelled it, gently point out what they wrote and what you need. Be specific: "I see you wrote '[their word]' but I need the word '${targetWord}'. Try again!"
- "help": If they ask for help or seem stuck, give a creative prompt about what ${targetWord} could do in the adventure.

Be conversational, not scripted. Acknowledge what they actually wrote. Keep responses under 25 words.` },
        { role: 'user', content: `Sentence: ${text}\n\nCurrent story context: ${storyContext.join(' ')}\n\nHelp the child continue Captain Asher's adventure using the word "${targetWord}".` }
      ];
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
      const data = await res.json();
      const raw: string = (data.reply || '').trim();
      let parsed: ContinuationEval | null = null;
      try { parsed = JSON.parse(raw) as ContinuationEval; } catch {}
      if (parsed && parsed.status && parsed.message) return parsed;
      // Fallback heuristic
      if (new RegExp(`\\b${targetWord}\\b`, 'i').test(text)) {
        return { status: 'valid', message: 'Great!' };
      }
      if (/help|hint|example|idk|don\'?t know/i.test(text)) {
        return { status: 'help', message: `No worries! What if Captain Asher's ${targetWord} could take him somewhere amazing? Where might it go?` };
      }
      return { status: 'invalid', message: `Use the word “${targetWord}” in your sentence.` };
    } catch {
      const targetWord = hookValidationWord;
      return { status: 'help', message: `Try using the word “${targetWord}”.` };
    }
  };

  const handleSubmitContinuation = async () => {
    const text = continuationInput.trim();
    if (!text) return;
      setValidationMessage('');
    const result = await validateContinuationWithAI(text);
    if (result.status === 'valid') {
      setValidationMessage(result.message || 'Great!');
      setValidatedContinuation(text);
      setStoryContext(prev => [...prev, text]);
      setContinuationInput('');
      // Immediately animate out (no added wait, no praise TTS)
        setIsContinuationHidden(true);
      setIsFeedbackRemoved(false);
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
    } else if (result.status === 'invalid') {
      setValidationMessage(result.message || 'Try again');
      void playElevenTTS(result.message || 'Try again');
    } else {
      const msg = result.message || `No worries! What if Captain Asher\'s ${hookTargetWord} could take him somewhere amazing? Where might it go?`;
      setValidationMessage(msg);
      setContinuationHeader(msg);
      void playElevenTTS(msg);
    }
  };

  // Voice recording handlers for continuation input (no Whisper; live recognition only)
  // Prefer Whisper: record audio and send to STT endpoint; also keep interim Web Speech in case
  const startContinuationRecording = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    // Start interim recognition if available
    let recognition: any = null;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
    }
    // Stop any playing audio before recording to avoid feedback
    audioManager.stopAll();
    // Start media recorder for Whisper
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          setIsContProcessing(true);
          const formData = new FormData();
          formData.append('audio', blob, 'continuation.webm');
          const resp = await fetch('/api/speech-to-text', { method: 'POST', body: formData });
          if (resp.ok) {
            const data = await resp.json();
            const text = (data.transcript || '').trim();
            if (text) setContinuationInput(prev => (prev ? (prev + ' ' + text).trim() : text));
          }
        } catch {}
        finally {
          setIsContProcessing(false);
          stream.getTracks().forEach(t => t.stop());
        }
      };
      recorder.start();
      setContMediaRecorder(recorder);
    } catch (err) {
      console.warn('Mic error for Whisper recording', err);
    }
    // Accumulate final chunks to avoid overwriting on pauses
    let accumulated = continuationInput || '';
    if (recognition) {
      recognition.onresult = (event: any) => {
        let interim = '';
        let newFinal = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) newFinal += res[0].transcript + ' ';
          else interim += res[0].transcript;
        }
        if (newFinal) {
          accumulated = (accumulated + ' ' + newFinal).replace(/\s+/g, ' ').trim() + ' ';
        }
        const display = (accumulated + interim).replace(/\s+/g, ' ').trim();
        setContinuationInput(display);
      };
      recognition.onerror = () => { setIsContRecording(false); };
      recognition.onend = () => { setIsContRecording(false); setContRecognition(null); };
      recognition.start();
      setContRecognition(recognition);
    }
    setIsContRecording(true);
  };

  const stopContinuationRecording = () => {
    if (contRecognition) {
      try { contRecognition.stop(); } catch {}
      setContRecognition(null);
    }
    if (contMediaRecorder) {
      try { contMediaRecorder.stop(); } catch {}
      setContMediaRecorder(null);
    }
    setIsContRecording(false);
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
        // Ensure feedback is visible
        try { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); } catch {}
      }
    }
  };

  // Audible confirmation on feedback for regular MCQ
  useEffect(() => {
    if (!showFeedback || !currentRegularQuestion || currentRegularQuestion.isSpelling) return;
    // For AI hook steps, we already autoplay the continuation prompt; avoid duplicate audio
    if (isAiHookStep) return;
    const speak = async () => {
      audioManager.stopAll();
      if (isCorrect) {
        await playElevenTTS('Great!');
      } else {
        await playElevenTTS('Not quite. Try again.');
      }
    };
    void speak();
  }, [showFeedback, isCorrect, currentRegularQuestion, isAiHookStep]);

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
    if (currentQuestionIndex < totalSteps - 1) {
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
      // Reset continuation UI state (but keep validatedContinuation for story context)
      setIsContinuationHidden(false);
      setHasAutoplayedContPrompt(false);
      setContinuationHeader('');
      setValidationMessage('');
      setContinuationInput('');
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
    <>
      {/* CSS Animations and Speech Bubbles */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.7; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
        }
        
        /* Speech bubble tails - AI on bottom left, User on bottom right */
        .speech-bubble-ai::before {
          content: '';
          position: absolute;
          left: -6px;
          bottom: 12px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 0 12px 12px;
          border-color: transparent transparent rgba(255,255,255,0.98) transparent;
          transform: rotate(45deg);
        }
        
        .speech-bubble-ai::after {
          content: '';
          position: absolute;
          left: -5px;
          bottom: 13px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 0 10px 10px;
          border-color: transparent transparent rgba(255,255,255,0.9) transparent;
          transform: rotate(45deg);
          z-index: 1;
        }
        
        .speech-bubble-student::before {
          content: '';
          position: absolute;
          right: -6px;
          bottom: 12px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 12px 12px 0 0;
          border-color: #FFFADB transparent transparent transparent;
          transform: rotate(45deg);
        }
        
        .speech-bubble-student::after {
          content: '';
          position: absolute;
          right: -5px;
          bottom: 13px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 10px 10px 0 0;
          border-color: rgba(255,245,205,0.9) transparent transparent transparent;
          transform: rotate(45deg);
          z-index: 1;
        }

        /* Subtle fade/slide animations for green box exit */
        .fade-out { opacity: 0.7; transition: opacity 400ms ease; }
        .slide-out { transform: translateX(20px); opacity: 0.0; transition: transform 450ms ease, opacity 450ms ease; }

        /* Pop-in animation for the new user story card */
        @keyframes pop-in {
          0% { transform: translateY(8px) scale(0.98); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
      
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
      {/* Step 4: move the AI hook into the central prompt; hide top-left bubble */}
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
        Step {currentQuestionIndex + 1} of {totalSteps}
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
      ) : isAdventureMode ? (
        <AdventureMode />
      ) : (
        <>
          {/* Regular Question Prompt - moved above image; for step 4, show AI hook here */}
          {!isBlendingQuestion && !isSpeechQuestion && (
            <div style={{
              marginBottom: '28.8px',
              padding: '16px 20px',
              background: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '20px',
              boxShadow: '0 12px 0 rgba(156,126,172,0.25), 0 12px 24px rgba(0,0,0,0.15)',
              maxWidth: '720px',
              margin: '0 auto 28.8px',
              position: 'relative'
            }}>
              {isAiHookStep ? (
                <>
                  <div style={{
                    color: '#111827',
                    lineHeight: 1.5,
                    fontWeight: 400,
                    fontSize: 20,
                    textAlign: 'center',
                    fontFamily: 'Quicksand, sans-serif'
                  }}>
                    {isSummaryLoading ? 'Creating…' : aiSummary}
                  </div>
                  {/* Audio button anchored bottom-right without affecting height */}
                  <button
                    onClick={handleSummaryAudio}
                    title={isSummarySpeaking ? 'Stop' : 'Hear'}
                    style={{
                      position: 'absolute',
                      right: 12,
                      bottom: 8,
                      width: 30,
                      height: 30,
                      borderRadius: 12,
                      border: 'none',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      color: 'white',
                      cursor: 'pointer',
                      boxShadow: '0 6px 18px rgba(139, 92, 246, 0.30)'
                    }}
                  >
                    🔊
                  </button>
                </>
              ) : (
                <>
                  <div style={{
                    fontSize: '19.2px',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '4.8px'
                  }}>
                    🎧 Listen to Captain Asher's word!
                  </div>
                  <div style={{ fontSize: '14.4px', color: '#6b7280', fontWeight: '500' }}>
                    What sound does it start with?
                  </div>
                </>
              )}
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
      {!isSpeechQuestion && showFeedback && !isFeedbackRemoved && (
        <div style={{
          marginTop: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
                    {/* Combined feedback + explanation container (compact) */}
          <div style={{
            padding: '16px 20px',
            borderRadius: '20px',
            background: isCorrect 
              ? '#10b981'
              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            textAlign: 'center',
            boxShadow: isCorrect 
              ? '0 12px 0 rgba(156,126,172,0.25), 0 24px 64px rgba(0,0,0,0.15)'
              : '0 8px 24px rgba(239, 68, 68, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            maxWidth: '720px',
            minWidth: '720px',
            margin: '0 auto'
          }}>
            <div style={{
              fontSize: '18px',
              fontWeight: 700,
              lineHeight: 1.5,
              width: '100%'
            }} className={isContinuationStep ? (isContinuationAnimating ? 'fade-out' : '') : ''}>
              {/* Show user's response if validated for Step 4 only, otherwise show the CTA */}
              {isCorrect && isContinuationStep && isContinuationHidden && validatedContinuation && isFirstRegularStep ? (
                <div style={{
                  fontFamily: 'Quicksand, sans-serif',
                  fontWeight: 500,
                  color: 'white',
                  fontSize: '18px',
                  lineHeight: 1.5
                }}>
                  {validatedContinuation}
                </div>
              ) : isCorrect && isContinuationStep
                ? (
                    <span>
                      {validationMessage || continuationHeader || (hookIntent === 'sound'
                        ? `Yay, "${hookTargetWord}" it is. What will you do with this ${hookTargetWord}? Let\'s include it in your story`
                        : `Awesome, let\'s keep the story going. Include the word "${hookTargetWord}" in what happens next!`)}
                      <button
                        onClick={() => { 
                          const line = validationMessage || continuationHeader || (hookIntent === 'sound'
                            ? `Yay, "${hookTargetWord}" it is. What will you do with this ${hookTargetWord}? Let\'s include it in your story`
                            : `Awesome, let\'s keep the story going. Include the word "${hookTargetWord}" in what happens next!`);
                          void playElevenTTS(line);
                        }}
                        title="Hear"
                        style={{
                          marginLeft: 10,
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          border: '1px solid rgba(255,255,255,0.6)',
                          background: 'rgba(255,255,255,0.25)',
                          cursor: 'pointer'
                        }}
                      >🔊</button>
                    </span>
                  )
              : isContinuationStep && validationMessage
                ? (
                    <span>
                      {validationMessage}
                      <button
                        onClick={() => { void playElevenTTS(validationMessage); }}
                        title="Hear"
                        style={{
                          marginLeft: 10,
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          border: '1px solid rgba(255,255,255,0.6)',
                          background: 'rgba(255,255,255,0.25)',
                          cursor: 'pointer'
                        }}
                      >🔊</button>
                    </span>
                  )
              : isCorrect && !isContinuationStep
                ? (currentRegularQuestion?.explanation || 'Great job!')
              : (currentRegularQuestion?.isSpelling
                  ? 'Listen to the word and try spelling it again.'
                  : `Listen to the word "${currentRegularQuestion?.word || 'this word'}" again. What sound do you hear at the beginning?`)}
            </div>

            {/* Continuation input row (only while composing) */}
            {isCorrect && isContinuationStep && !isContinuationHidden && (
              <div style={{
                marginTop: '12px',
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '1fr 52px 120px',
                gap: '8px',
                alignItems: 'center'
              }}>
                <textarea
                  value={continuationInput}
                  onChange={(e) => setContinuationInput(e.target.value)}
                  placeholder="Type your 1–2 sentences here"
                  rows={2}
                  style={{
                    width: '100%',
                    borderRadius: 9999,
                    border: '2px solid rgba(59,130,246,0.6)',
                    padding: '10px 16px',
                    resize: 'none',
                    minHeight: '40px',
                    maxHeight: '64px',
                    outline: 'none',
                    boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.6)'
                  }}
                />
                {/* Mic button styled like step 3, immediately to the right */}
                <button
                  onClick={isContRecording ? stopContinuationRecording : startContinuationRecording}
                  title={isContRecording ? 'Stop recording' : 'Speak'}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: isContRecording ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: '1px solid rgba(255,255,255,0.6)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                >
                  {/* match Step 3 icon style */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="white"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="white"/>
                  </svg>
                </button>
                <button
                  onClick={handleSubmitContinuation}
                  style={{
                    minWidth: 120,
                    height: 44,
                    borderRadius: 9999,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
                    color: '#111827',
                    border: '1px solid rgba(255,255,255,0.6)',
                    cursor: 'pointer',
                    fontWeight: 800,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                >
                  Submit
                </button>
              </div>
            )}

            {/* Removed separate white card - user response now shows inside green container */}
          </div>

          {/* Action buttons (no Next button when correct) */}
          <div style={{ display: 'flex', gap: '16px' }}>
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

            {/* No next button here when correct to keep the box compact */}
          </div>

          {/* Step 4 continuation experiment moved into green container above */}
        </div>
      )}

      {/* Step-level Retry: top-right, left of Step x of y */}
      {isFirstRegularStep && (
        <button
          onClick={() => {
            setHasGeneratedSummary(false);
            setHasAutoplayedSummary(false);
            setAiSummary('');
            setValidatedContinuation('');
            setShowFeedback(false);
            setIsCorrect(false);
            setHasAutoplayedContPrompt(false);
            setIsContinuationHidden(false);
            setContinuationInput('');
            setValidationMessage('');
            setIsFeedbackRemoved(false);
            // Remove the most recent continuation from story context if it matches
            setStoryContext(prev => {
              if (!validatedContinuation) return prev;
              if (prev.length === 0) return prev;
              const lastIdx = prev.length - 1;
              return prev[lastIdx] === validatedContinuation ? prev.slice(0, lastIdx) : prev;
            });
          }}
          title="Retry"
          style={{
            position: 'absolute',
            top: '16px',
            right: '140px',
            zIndex: 11,
            minWidth: '96px',
            height: '38.4px',
            borderRadius: '12.8px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12.8px',
            fontWeight: 700,
            boxShadow: '0 6.4px 19.2px rgba(245, 158, 11, 0.35)'
          }}
        >
          ↻ Retry
        </button>
      )}

      {/* Global navigation - bottom right */}
      <div style={{ position: 'fixed', bottom: '16px', right: '16px', display: 'flex', gap: '9.6px', zIndex: 10 }}>
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

      {/* Removed bottom-right speech bubble; user continuation now appears inline in the green box area */}
    </>
  );
}
