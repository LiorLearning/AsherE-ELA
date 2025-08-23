import React, { useCallback, useMemo, useState } from 'react';
import { ChatPanel } from './ChatPanel';
import { ImagePanel } from './ImagePanel';
import { QuestionPanel } from './QuestionPanel';
import { LandingPage } from './LandingPage';
import { PictureBook } from './PictureBook';
import { AsherPictureBook } from './AsherPictureBook';
import { ConnorPictureBook } from './ConnorPictureBook';
import { Button } from './components/Button';

export function App(): JSX.Element {
  // Landing page state
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [storyMode, setStoryMode] = useState<'adventure' | 'picture-book'>('picture-book');
  const [currentWorld, setCurrentWorld] = useState<'asher' | 'connor'>('asher');

  // Practice loop state (placeholder assets, no DALL·E)
  const [chapter, setChapter] = useState<1 | 2>(1);
  const [progress, setProgress] = useState(0); // 0..3
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWin, setShowWin] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // collapsed by default

  const chapterImages = useMemo(() => {
    // Four states per chapter: 0 start, 1, 2, 3 complete
    const ch1 = [
      'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1600&auto=format&fit=crop'
    ];
    const ch2 = [
      'https://images.unsplash.com/photo-1462332420958-a05d1e002413?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1491975474562-1f4e30bc9468?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop'
    ];
    return chapter === 1 ? ch1 : ch2;
  }, [chapter]);

  const questions = useMemo(() => {
    if (chapter === 1) {
      return [
        { id: 'q1', type: 'mc', prompt: 'Where are Captain Asher and his team?', options: ['A snowy mountain', 'A futuristic jungle on Ragonia 7\'s moon', 'Under the ocean'], correct: 1 },
        { id: 'q2', type: 'spelling', prompt: 'Fix the word from the story:', target: 'portal', options: ['portel', 'portal', 'protale'], correct: 1 },
        { id: 'bonus', type: 'micro', prompt: 'Who is Asher\'s metallic robotic bird?', options: ['Clay', 'Shracker'], correct: 1 }
      ] as const;
    }
    return [
      { id: 'q1', type: 'mc', prompt: 'Why does Asher use robot clones?', options: ['To confuse enemies', 'To build a camp', 'To plant trees'], correct: 0 },
      { id: 'q2', type: 'order', prompt: 'Arrange the sentence:', fragments: ['Shracker scans', 'the portal', 'for clues'], order: [0,1,2] },
      { id: 'bonus', type: 'micro', prompt: 'Which bird-like sidekick helps scan?', options: ['Shracker', 'Clay'], correct: 0 }
    ] as const;
  }, [chapter]);

  const [questionIndex, setQuestionIndex] = useState(0); // 0..1 -> main questions, then bonus if needed
  const [selected, setSelected] = useState<number | null>(null);
  const [fragmentsOrder, setFragmentsOrder] = useState<number[]>([]);

  const startChapter = useCallback(() => {
    setError(null);
    setShowWin(false);
    setVideoUrl(null);
    setProgress(0);
    setQuestionIndex(0);
    setSelected(null);
    setFragmentsOrder([]);
    setImageUrl(chapterImages[0] ?? null);
  }, [chapterImages]);

  const handleGenerate = useCallback((_: string) => {
    // repurpose Create Image button to start or advance chapter
    if (!imageUrl || showWin) {
      startChapter();
    } else {
      // If chapter is in progress and user clicks button again, re-show current state
      setImageUrl(chapterImages[Math.min(progress, 3)] ?? null);
    }
  }, [imageUrl, showWin, startChapter, chapterImages, progress]);

  // Landing page handlers
  const handleSelectStory = useCallback((storyId: string, mode: 'adventure' | 'picture-book' = 'picture-book') => {
    console.log('Selected story:', storyId, 'mode:', mode);
    setSelectedStoryId(storyId);
    setStoryMode(mode);
    setShowLandingPage(false);
  }, []);

  const handleCreateNewStory = useCallback(() => {
    console.log('Creating new story');
    setSelectedStoryId('new-story');
    setShowLandingPage(false);
  }, []);

  const handleBackToLibrary = useCallback(() => {
    setShowLandingPage(true);
    setSelectedStoryId(null);
    setStoryMode('picture-book');
    setCurrentWorld('asher');
  }, []);

  const handleNextWorld = useCallback(() => {
    setCurrentWorld('connor');
  }, []);

  const handlePreviousWorld = useCallback(() => {
    setCurrentWorld('asher');
  }, []);

  // Picture book data
  const asherStoryPages = useMemo(() => [
    {
      id: 'page-1',
      pageNumber: 1,
      text: 'In a futuristic underground starbase hidden beneath alien jungle vines, lived a young adventurer named Captain Asher. He wore a glowing space suit with neon accents and had his best friend—Clay, a massive brown dragon with warm amber eyes.',
      imageUrl: undefined
    },
    {
      id: 'page-2',
      pageNumber: 2,
      text: 'One morning, Clay flew off to explore a strange portal. Asher followed, calling out through his suit\'s communicator—but Clay was gone.',
      imageUrl: undefined
    },
    {
      id: 'page-3',
      pageNumber: 3,
      text: 'Just then, a glowing data crystal floated down from above. Inside was a shimmering hologram… pointing the way to his lost friend.',
      imageUrl: undefined
    },
    {
      id: 'page-4',
      pageNumber: 4,
      text: 'Asher set off through the starbase. He spotted a Time Strangler guarding some portal controls. He tried to activate them with his tech tools, but they vanished with a spark!',
      imageUrl: undefined
    },
    {
      id: 'page-5',
      pageNumber: 5,
      text: 'In the control room, he found only a glowing energy core. He sighed, powered it down, and declared, "No more energy overloads for me!"',
      imageUrl: undefined
    },
    {
      id: 'page-6',
      pageNumber: 6,
      text: 'Suddenly, a single portal stabilized in the chamber. Asher carefully recalibrated it, and the Time Strangler\'s device sparkled and teleported away.',
      imageUrl: undefined
    },
    {
      id: 'page-7',
      pageNumber: 7,
      text: 'High above, through the starbase dome, a BLT sandwich ship zoomed by. Someone threw out supplies—Asher gasped!',
      imageUrl: undefined
    },
    {
      id: 'page-8',
      pageNumber: 8,
      text: 'It was a tiny robot companion! Asher caught it just in time with his energy net. "You\'re safe," he whispered.',
      imageUrl: undefined
    },
    {
      id: 'page-9',
      pageNumber: 9,
      text: 'He named the robot Shracker. It scanned and hovered beside him, metallic and bright.',
      imageUrl: undefined
    },
    {
      id: 'page-10',
      pageNumber: 10,
      text: 'As they walked deeper into the starbase, something rustled in the alien plants... Mango—a small brown dragon with enchanting powers—peeked out and gave a tiny roar.',
      imageUrl: undefined
    },
    {
      id: 'page-11',
      pageNumber: 11,
      text: 'Asher welcomed him warmly. "You\'re joining our space team too," he smiled. Now he had his robot friend... and Mango.',
      imageUrl: undefined
    },
    {
      id: 'page-12',
      pageNumber: 12,
      text: 'The glowing crystal shimmered again—revealing a new portal destination. With his space friends by his side, Asher took a deep breath... and stepped into the unknown dimension.',
      imageUrl: undefined
    },
    {
      id: 'page-13',
      pageNumber: 13,
      text: 'Chapter 2\n\n to be continued',
      imageUrl: undefined
    }
  ], []);

  function onAnswer(): void {
    const q = questions[questionIndex];
    if (!q) return;
    let correct = false;
    if (q.type === 'mc' || q.type === 'spelling' || q.type === 'micro') {
      correct = selected === q.correct;
    } else if (q.type === 'order') {
      correct = JSON.stringify(fragmentsOrder) === JSON.stringify(q.order);
    }
    if (!correct) return;

    const newProgress = Math.min(progress + 1, 3);
    setProgress(newProgress);
    setImageUrl(chapterImages[newProgress] ?? null);

    // Advance to next question or bonus
    if (newProgress >= 3) {
      setShowWin(true);
      // Kick off video creation in background
      setVideoLoading(true);
      void (async () => {
        try {
          const res = await fetch('/api/video', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: 'Captain Asher\'s progress through the jungle: portal stabilizes, clones appear, bridge restored.', durationSeconds: 8, aspectRatio: '16:9' }) });
          const data = await res.json();
          setVideoUrl(data?.url ?? null);
        } catch {
          setVideoUrl(null);
        } finally {
          setVideoLoading(false);
        }
      })();
    } else {
      setQuestionIndex(prev => {
        if (prev === 0) return 1; // second question
        // after two main questions, use bonus until reach 3
        return 2; // bonus index
      });
      setSelected(null);
    }
  }

  // Show landing page first
  if (showLandingPage) {
    return (
      <LandingPage 
        onSelectStory={handleSelectStory}
        onCreateNewStory={handleCreateNewStory}
      />
    );
  }

  // Show picture book for older story (Stella and tiny frog)
  if (selectedStoryId === 'stella-tiny-frog' && storyMode === 'picture-book') {
    return (
      <PictureBook
        title="Captain Asher and the Futuristic Starbase"
        author="by Asher, 2nd grade"
        pages={asherStoryPages}
        onBack={handleBackToLibrary}
      />
    );
  }

  // Show new AsherPictureBook for Captain Asher's adventure
  if (selectedStoryId === 'captain-asher-time-stranglers' && storyMode === 'picture-book') {
    if (currentWorld === 'asher') {
      return (
        <AsherPictureBook
          onBack={handleBackToLibrary}
          onNext={handleNextWorld}
        />
      );
    } else if (currentWorld === 'connor') {
      return (
        <ConnorPictureBook
          onBack={handleBackToLibrary}
          onPrevious={handlePreviousWorld}
        />
      );
    }
  }
  
  // Show adventure mode for Asher story (when mode is adventure) or new story creation
  if ((selectedStoryId === 'captain-asher-time-stranglers' && storyMode === 'adventure') || selectedStoryId === 'new-story') {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `${isChatOpen ? '420px' : '0px'} 1fr`,
        gridTemplateRows: '100%',
        height: '100%',
        width: '100%',
        transition: 'grid-template-columns 200ms ease'
      }}>
        {/* Chat column */}
        <div
          id="chat-panel"
          aria-hidden={!isChatOpen}
          style={{
            borderRight: isChatOpen ? '1px solid #E5E7EB' : 'none',
            background: '#FFFFFF',
            overflow: 'hidden',
            pointerEvents: isChatOpen ? 'auto' : 'none'
          }}
        >
          {isChatOpen && <ChatPanel onGenerateImage={handleGenerate} />}
        </div>
        {/* Main column */}
        <div style={{ position: 'relative' }}>
          {/* Back to Library button */}
          <button
            onClick={handleBackToLibrary}
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 20,
              padding: '8px 16px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontFamily: 'Quicksand, system-ui, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            📚 Back to Library
          </button>
          
          {/* Toggle chat arrow */}
          <button
            onClick={() => setIsChatOpen(v => !v)}
            aria-controls="chat-panel"
            aria-expanded={isChatOpen}
            style={{
              position: 'absolute',
              top: '50%',
              left: 8,
              transform: 'translateY(-50%)',
              zIndex: 20,
              width: 44,
              height: 44,
              borderRadius: 9999,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.6)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(-50%) scale(0.95)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
            title={isChatOpen ? 'Collapse chat' : 'Expand chat'}
            aria-label={isChatOpen ? 'Collapse chat' : 'Expand chat'}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>
              {isChatOpen ? '◀' : '▶'}
            </span>
          </button>

          <QuestionPanel
            onComplete={() => {
              console.log('All questions completed!');
              // Handle completion logic here
            }}
          />
        </div>
      </div>
    );
  }

  // Fallback - should not reach here normally
  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h2>Story not found</h2>
      <button onClick={handleBackToLibrary}>Back to Library</button>
    </div>
  );
}
