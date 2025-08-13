import React, { useEffect, useMemo, useRef, useState } from 'react';
import bg1Url from '../../../bg1.png';

export function AdventureMode(): JSX.Element {
  const [adventureMessages, setAdventureMessages] = useState<Array<{ role: 'ai' | 'student'; text: string; isImage?: boolean; isLoading?: boolean; imageUrl?: string }>>([
    { role: 'ai', text: "🎉 Amazing reading, brave explorer! Captain Asher needs your help planning his next moon jungle adventure. What exciting mission should he go on next? 🚀🌙" }
  ]);
  const [adventureInput, setAdventureInput] = useState('');
  const [isAdventureRecording, setIsAdventureRecording] = useState(false);
  const [adventureSpeechRecognition, setAdventureSpeechRecognition] = useState<any>(null);
  const ADVENTURE_IMAGE_OVERLAY_OPACITY = 0.45;
  const adventureScrollRef = useRef<HTMLDivElement | null>(null);

  const [showFullscreenImage, setShowFullscreenImage] = useState(false);
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(null);

  const [playingAudio, setPlayingAudio] = useState<number | null>(null);
  const [audioLoading, setAudioLoading] = useState<number | null>(null);
  const [autoPlayedMessages, setAutoPlayedMessages] = useState<Set<number>>(new Set());
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasUserGestureRef = useRef<boolean>(false);

  useEffect(() => {
    const node = adventureScrollRef.current;
    if (!node) return;
    requestAnimationFrame(() => {
      node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
    });
  }, [adventureMessages]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const markGesture = () => { hasUserGestureRef.current = true; };
    window.addEventListener('pointerdown', markGesture, { once: true });
    window.addEventListener('keydown', markGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', markGesture as () => void);
      window.removeEventListener('keydown', markGesture as () => void);
    };
  }, []);

  useEffect(() => {
    const latestMessage = adventureMessages[adventureMessages.length - 1];
    const latestIndex = adventureMessages.length - 1;
    if (
      latestMessage &&
      latestMessage.role === 'ai' &&
      !latestMessage.isLoading &&
      !latestMessage.isImage &&
      !autoPlayedMessages.has(latestIndex) &&
      latestMessage.text.trim()
    ) {
      setAutoPlayedMessages(prev => new Set([...prev, latestIndex]));
      setTimeout(() => {
        void playAIResponse(latestIndex, latestMessage.text);
      }, 500);
    }
  }, [adventureMessages, autoPlayedMessages]);

  const generateAdventureImage = async () => {
    const text = adventureInput.trim();
    if (!text) return;

    setAdventureMessages(prev => [...prev, { role: 'student', text: `🌄 Create image: ${text}` }]);
    setAdventureInput('');
    setAdventureMessages(prev => [...prev, { role: 'ai', text: 'Creating your adventure image...', isLoading: true }]);

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });
      const data = await response.json();
      if (response.ok && data.imageUrl) {
        setAdventureMessages(prev => {
          const newMessages = [...prev];
          const loadingIndex = newMessages.findIndex(m => m.isLoading);
          if (loadingIndex !== -1) {
            newMessages[loadingIndex] = {
              role: 'ai',
              text: "Here's your adventure image! 🌄✨",
              isImage: true,
              imageUrl: data.imageUrl,
              isLoading: false
            };
          }
          return newMessages;
        });
        setFullscreenImageUrl(data.imageUrl);
        setShowFullscreenImage(true);
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setAdventureMessages(prev => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.findIndex(m => m.isLoading);
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = {
            role: 'ai',
            text: "Sorry, I couldn't create that image. Please try again with a different description! 🌄",
            isLoading: false
          };
        }
        return newMessages;
      });
    }
  };

  const playAIResponse = async (messageIndex: number, text: string) => {
    try {
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch {}
        audioRef.current.currentTime = 0;
      }
      setAudioLoading(messageIndex);
      const cleanText = text.replace(/[🎉🚀🌙🌄✨😊]/g, '').trim();
      if (!cleanText) {
        setAudioLoading(null);
        return;
      }
      let audioUrl = audioCacheRef.current.get(cleanText);
      if (!audioUrl) {
        const response = await fetch('/api/text-to-speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: cleanText })
        });
        if (!response.ok) {
          let upstream = 'unknown';
          try { upstream = await response.text(); } catch {}
          throw new Error(`TTS API error: ${response.status} ${upstream}`);
        }
        const data = await response.json();
        audioUrl = data.audioUrl as string | undefined;
        if (audioUrl) audioCacheRef.current.set(cleanText, audioUrl);
      }
      if (audioUrl) {
        setAudioLoading(null);
        setPlayingAudio(messageIndex);
        const audio = audioRef.current ?? new Audio();
        audioRef.current = audio;
        audio.src = audioUrl;
        audio.onended = () => setPlayingAudio(prev => prev === messageIndex ? null : prev);
        audio.onerror = () => setPlayingAudio(prev => prev === messageIndex ? null : prev);
        audio.onabort = () => setPlayingAudio(prev => prev === messageIndex ? null : prev);
        try {
          if (!hasUserGestureRef.current) {
            const resumeOnGesture = () => {
              hasUserGestureRef.current = true;
              window.removeEventListener('pointerdown', resumeOnGesture);
              window.removeEventListener('keydown', resumeOnGesture);
              void audio.play().catch(err => {
                console.error('Deferred audio play failed:', err);
                setPlayingAudio(prev => prev === messageIndex ? null : prev);
              });
            };
            window.addEventListener('pointerdown', resumeOnGesture, { once: true });
            window.addEventListener('keydown', resumeOnGesture, { once: true });
          } else {
            await audio.play();
          }
        } catch (playError) {
          console.error('Audio play failed:', playError);
          setPlayingAudio(prev => prev === messageIndex ? null : prev);
        }
      } else {
        throw new Error('No audio URL returned');
      }
    } catch (error) {
      console.error('Error playing AI response:', error);
      setAudioLoading(prev => prev === messageIndex ? null : prev);
      setPlayingAudio(prev => prev === messageIndex ? null : prev);
    }
  };

  const sendAdventureMessage = async () => {
    const text = adventureInput.trim();
    if (!text) return;
    if (text.toLowerCase() === 'image' || text.toLowerCase() === 'create image' || text.toLowerCase().startsWith('create image')) {
      const imagePrompt = text.toLowerCase() === 'image' || text.toLowerCase() === 'create image'
        ? 'Captain Asher on an exciting space adventure'
        : text.replace(/^create image\s*/i, '').trim() || 'Captain Asher on an exciting space adventure';
      setAdventureMessages(prev => [...prev, { role: 'student', text: `🌄 ${text}` }]);
      setAdventureInput('');
      setAdventureMessages(prev => [...prev, { role: 'ai', text: 'Creating your adventure image...', isLoading: true }]);
      try {
        const response = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: imagePrompt })
        });
        const data = await response.json();
        if (response.ok && data.imageUrl) {
          setAdventureMessages(prev => {
            const newMessages = [...prev];
            const loadingIndex = newMessages.findIndex(m => m.isLoading);
            if (loadingIndex !== -1) {
              newMessages[loadingIndex] = {
                role: 'ai',
                text: "Here's your adventure image! 🌄✨",
                isImage: true,
                imageUrl: data.imageUrl,
                isLoading: false
              };
            }
            return newMessages;
          });
          setFullscreenImageUrl(data.imageUrl);
          setShowFullscreenImage(true);
        } else {
          throw new Error(data.error || 'Failed to generate image');
        }
      } catch (error) {
        console.error('Error generating image:', error);
        setAdventureMessages(prev => {
          const newMessages = [...prev];
          const loadingIndex = newMessages.findIndex(m => m.isLoading);
          if (loadingIndex !== -1) {
            newMessages[loadingIndex] = {
              role: 'ai',
              text: "Sorry, I couldn't create that image. Please try again with a different description! 🌄",
              isLoading: false
            };
          }
          return newMessages;
        });
      }
      return;
    }

    setAdventureMessages(prev => [...prev, { role: 'student', text }]);
    setAdventureInput('');
    setAdventureMessages(prev => [...prev, { role: 'ai', text: 'Thinking about your adventure...', isLoading: true }]);
    try {
      const currentMessages = adventureMessages.filter(m => !m.isLoading && !m.isImage);
      const conversationMessages = [
        {
          role: 'system',
          content: `You are Captain Asher's AI companion helping young students (ages 5-8) create exciting reading adventures. You should:

1. Respond enthusiastically and encouragingly to their ideas
2. Ask follow-up questions to develop their story ideas further
3. Suggest creative plot developments that involve reading and problem-solving
4. Keep responses appropriate for young children (no scary or inappropriate content)
5. Encourage them to use their imagination and think about characters, settings, and adventures
6. Reference the existing story elements: Captain Asher (space explorer), Clay (dragon sidekick), Shracker (robot bird), moon jungle adventures
7. Keep responses to 1-2 sentences maximum for easy reading
8. Use encouraging emojis and simple vocabulary
9. Help build on their previous ideas to create a cohesive story
10. Respond directly to what the student just said - don't repeat the same response

The student just completed reading a story about Captain Asher in the moon jungle and is now creating their next adventure.`
        },
        ...currentMessages
          .slice(-4)
          .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
        { role: 'user', content: text }
      ];
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationMessages })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const aiReply = data.reply || 'That sounds like an amazing adventure! What happens next?';
      setAdventureMessages(prev => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.findIndex(m => m.isLoading);
        if (loadingIndex !== -1) newMessages[loadingIndex] = { role: 'ai', text: aiReply, isLoading: false } as any;
        return newMessages;
      });
    } catch (error) {
      console.error('Error calling GPT-4o API:', error);
      setAdventureMessages(prev => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.findIndex(m => m.isLoading);
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = {
            role: 'ai',
            text: 'Wow, that sounds like an exciting adventure! 🚀 Tell me more about what Captain Asher should do next!',
            isLoading: false
          } as any;
        }
        return newMessages;
      });
    }
  };

  const toggleAdventureMic = () => {
    if (isAdventureRecording) {
      setIsAdventureRecording(false);
      if (adventureSpeechRecognition) {
        adventureSpeechRecognition.stop();
        setAdventureSpeechRecognition(null);
      }
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      let text = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        text += result[0].transcript;
      }
      setAdventureInput(text);
    };
    recognition.onend = () => {
      setIsAdventureRecording(false);
      setAdventureSpeechRecognition(null);
    };
    recognition.start();
    setAdventureSpeechRecognition(recognition);
    setIsAdventureRecording(true);
  };

  return (
    <>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
        @keyframes sparkle { 0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.7;} 50% { transform: scale(1.2) rotate(180deg); opacity: 1;} }
        .speech-bubble-ai::before { content: ''; position: absolute; left: -6px; bottom: 12px; width: 0; height: 0; border-style: solid; border-width: 0 0 12px 12px; border-color: transparent transparent rgba(255,255,255,0.98) transparent; transform: rotate(45deg);} 
        .speech-bubble-ai::after { content: ''; position: absolute; left: -5px; bottom: 13px; width: 0; height: 0; border-style: solid; border-width: 0 0 10px 10px; border-color: transparent transparent rgba(255,255,255,0.9) transparent; transform: rotate(45deg); z-index: 1; }
        .speech-bubble-student::before { content: ''; position: absolute; right: -6px; bottom: 12px; width: 0; height: 0; border-style: solid; border-width: 12px 12px 0 0; border-color: #FFFADB transparent transparent transparent; transform: rotate(45deg);} 
        .speech-bubble-student::after { content: ''; position: absolute; right: -5px; bottom: 13px; width: 0; height: 0; border-style: solid; border-width: 10px 10px 0 0; border-color: rgba(255,245,205,0.9) transparent transparent transparent; transform: rotate(45deg); z-index: 1; }
      `}</style>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '0 80px'
      }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '840px', height: '560px', borderRadius: 32, overflow: 'hidden', boxShadow: '9.6px 14.4px 0 rgba(156, 126, 172, 0.25), 0 22.4px 64px rgba(0,0,0,0.08)' }}>
          <div style={{ position: 'absolute', inset: 0 as any, backgroundImage: `url(${bg1Url})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.75 }} />
          <div style={{ position: 'absolute', inset: 0 as any, background: `rgba(0,0,0,${ADVENTURE_IMAGE_OVERLAY_OPACITY})` }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', padding: '20px 24px', height: '100%' }}>
            <div ref={adventureScrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 6, paddingBottom: 16 }}>
              {adventureMessages.map((m, i) => (
                <div key={i} className={`${m.role === 'student' ? 'speech-bubble-student' : 'speech-bubble-ai'} ${(m.isImage || m.isLoading) ? 'has-image' : ''}`}
                  style={{ alignSelf: m.role === 'student' ? 'flex-end' : 'flex-start', background: m.role === 'student' ? '#FFFADB' : 'rgba(255,255,255,0.98)', color: m.role === 'student' ? '#000000' : '#111827', padding: (m.isImage || m.isLoading) ? '8px' : '10px 26px 10px 14px', borderRadius: 18, maxWidth: (m.isImage || m.isLoading) ? '60%' : '80%', boxShadow: '0 6px 18px rgba(0,0,0,0.12)', position: 'relative', border: m.role === 'student' ? '1px solid rgba(255,245,205,0.8)' : '1px solid rgba(255,255,255,0.9)', marginLeft: m.role === 'student' ? '0' : '12px', marginRight: m.role === 'student' ? '12px' : '0', marginBottom: '8px' }}>
                  {m.isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16, gap: 12 }}>
                      <div style={{ width: 40, height: 40, border: '3px solid rgba(139,92,246,0.2)', borderTop: '3px solid #8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', textAlign: 'center', fontFamily: 'Quicksand, sans-serif' }}>{m.text}</div>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', animation: 'sparkle 1.5s ease-in-out infinite' }} />
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', animation: 'sparkle 1.5s ease-in-out infinite 0.3s' }} />
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', animation: 'sparkle 1.5s ease-in-out infinite 0.6s' }} />
                      </div>
                    </div>
                  ) : m.isImage ? (
                    <div style={{ position: 'relative' }}>
                      {m.text && m.text !== 'IMAGE_GENERATED' && (
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', textAlign: 'center', fontFamily: 'Quicksand, sans-serif', marginBottom: 8 }}>{m.text}</div>
                      )}
                      <img src={m.imageUrl || bg1Url} alt={m.imageUrl ? 'Generated adventure image' : 'Adventure Scene'}
                        onClick={() => { if (m.imageUrl) { setFullscreenImageUrl(m.imageUrl); setShowFullscreenImage(true); } else { setShowFullscreenImage(true); } }}
                        style={{ width: '100%', height: 'auto', maxHeight: 200, objectFit: 'cover', borderRadius: 12, border: '2px solid rgba(255,255,255,0.9)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.02)'; (e.currentTarget as HTMLImageElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLImageElement).style.boxShadow = 'none'; }}
                      />
                      <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 500, }}>🔍 {m.imageUrl ? 'Click to open' : 'Click to expand'}</div>
                    </div>
                  ) : (
                    <span style={{ fontFamily: 'Quicksand, sans-serif', fontSize: 15, fontWeight: 500, lineHeight: 1.4 }}>{m.text}</span>
                  )}
                  {m.role === 'ai' && !m.isLoading && !m.isImage ? (
                    <button onClick={() => void playAIResponse(i, m.text)} disabled={audioLoading === i}
                      style={{ position: 'absolute', right: 8, bottom: 6, width: 20, height: 20, borderRadius: 10, border: 'none', background: playingAudio === i ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', cursor: audioLoading === i ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, boxShadow: '0 2px 6px rgba(0,0,0,0.2)', transition: 'all 0.2s ease', opacity: audioLoading === i ? 0.6 : 1 }}
                      title={audioLoading === i ? 'Loading audio...' : playingAudio === i ? 'Playing...' : 'Listen to Captain Asher'}
                      onMouseEnter={(e) => { if (audioLoading !== i) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                    >{audioLoading === i ? '⋯' : playingAudio === i ? '🔴' : '🔊'}</button>
                  ) : (
                    <span style={{ position: 'absolute', right: 8, bottom: 6, fontSize: 12, color: '#4b5563' }}>✓</span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.95)', padding: '8px 12px', borderRadius: 20, gap: 10, border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <input value={adventureInput} onChange={(e) => setAdventureInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void sendAdventureMessage(); }} placeholder="Message..."
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#111827', fontSize: 16, fontWeight: 400, fontFamily: 'Quicksand, sans-serif' }} />
                <button onClick={() => void generateAdventureImage()} aria-label="Generate Image" style={{ width: 32, height: 32, borderRadius: 16, border: '2px solid rgba(16,185,129,0.3)', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }} title="Generate image from your message">🌄</button>
                <button onClick={() => void sendAdventureMessage()} aria-label="Send" style={{ width: 32, height: 32, borderRadius: 16, border: '2px solid rgba(139,92,246,0.3)', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▲</button>
              </div>
              <button onClick={toggleAdventureMic} aria-label="Record" style={{ width: 48, height: 48, borderRadius: 24, border: 'none', cursor: 'pointer', background: isAdventureRecording ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: isAdventureRecording ? '0 6px 18px rgba(239, 68, 68, 0.3)' : '0 6px 18px rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isAdventureRecording ? (<div style={{ width: 14, height: 14, background: 'white', borderRadius: 3 }} />) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="white"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="white"/></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showFullscreenImage && (
        <div style={{ position: 'fixed', inset: 0 as any, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowFullscreenImage(false); setFullscreenImageUrl(null); } }}
          onKeyDown={(e) => { if ((e as any).key === 'Escape') { setShowFullscreenImage(false); setFullscreenImageUrl(null); } }}
          tabIndex={0}
        >
          <button onClick={() => { setShowFullscreenImage(false); setFullscreenImageUrl(null); }}
            style={{ position: 'absolute', top: 24, right: 24, width: 56, height: 56, borderRadius: 28, background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#374151', boxShadow: '0 6px 20px rgba(0,0,0,0.4)', transition: 'all 0.2s ease', zIndex: 1002, fontWeight: 'bold' }}
            title="Close fullscreen image"
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,1)'; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 25px rgba(0,0,0,0.5)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.95)'; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)'; }}
          >
            ✕
          </button>
          <img src={fullscreenImageUrl || bg1Url} alt={fullscreenImageUrl ? 'Generated Adventure Image' : 'Adventure Scene'}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} />
          {fullscreenImageUrl && (
            <div style={{ position: 'absolute', bottom: 24, left: 24, background: 'rgba(0,0,0,0.8)', color: 'white', padding: '12px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500, fontFamily: 'Quicksand, sans-serif' }}>🌄 Generated by DALL-E 3</div>
          )}
        </div>
      )}
    </>
  );
}


