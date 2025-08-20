import React, { useState, useCallback, useEffect } from 'react';

type PictureBookPage = {
  id: string;
  imageUrl?: string;
  text: string;
  pageNumber: number;
};

type Props = {
  title: string;
  author: string;
  pages: PictureBookPage[];
  onBack: () => void;
};

export function PictureBook({ title, author, pages, onBack }: Props): JSX.Element {
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pagesWithImages, setPagesWithImages] = useState<PictureBookPage[]>(() => {
    const staticImageMap: Record<number, string> = {
      1: 'https://tutor.mathkraft.org/_next/image?url=%2Fapi%2Fproxy%3Furl%3Dhttps%253A%252F%252Fd1ptidrpttdm41.cloudfront.net%252Ftestuser4%252F20250820_161012.png&w=3840&q=75&dpl=dpl_2uGXzhZZsLneniBZtsxr7PEabQXN',
      2: 'https://tutor.mathkraft.org/_next/image?url=%2Fapi%2Fproxy%3Furl%3Dhttps%253A%252F%252Fd1ptidrpttdm41.cloudfront.net%252Ftestuser4%252F20250820_161116.png&w=3840&q=75&dpl=dpl_2uGXzhZZsLneniBZtsxr7PEabQXN',
      3: 'https://tutor.mathkraft.org/_next/image?url=%2Fapi%2Fproxy%3Furl%3Dhttps%253A%252F%252Fd1ptidrpttdm41.cloudfront.net%252Ftestuser4%252F20250820_161216.png&w=3840&q=75&dpl=dpl_2uGXzhZZsLneniBZtsxr7PEabQXN',
      4: 'https://tutor.mathkraft.org/_next/image?url=%2Fapi%2Fproxy%3Furl%3Dhttps%253A%252F%252Fd1ptidrpttdm41.cloudfront.net%252Ftestuser4%252F20250820_161358.png&w=3840&q=75&dpl=dpl_2uGXzhZZsLneniBZtsxr7PEabQXN',
      5: 'https://tutor.mathkraft.org/_next/image?url=%2Fapi%2Fproxy%3Furl%3Dhttps%253A%252F%252Fd1ptidrpttdm41.cloudfront.net%252Ftestuser4%252F20250820_161546.png&w=3840&q=75&dpl=dpl_2uGXzhZZsLneniBZtsxr7PEabQXN',
      6: 'https://tutor.mathkraft.org/_next/image?url=%2Fapi%2Fproxy%3Furl%3Dhttps%253A%252F%252Fd1ptidrpttdm41.cloudfront.net%252Ftestuser4%252F20250820_162220.png&w=3840&q=75&dpl=dpl_2uGXzhZZsLneniBZtsxr7PEabQXN',
      7: 'https://tutor.mathkraft.org/_next/image?url=%2Fapi%2Fproxy%3Furl%3Dhttps%253A%252F%252Fd1ptidrpttdm41.cloudfront.net%252Ftestuser4%252F20250820_162353.png&w=3840&q=75&dpl=dpl_2uGXzhZZsLneniBZtsxr7PEabQXN',
      8: 'https://tutor.mathkraft.org/_next/image?url=%2Fapi%2Fproxy%3Furl%3Dhttps%253A%252F%252Fd1ptidrpttdm41.cloudfront.net%252Ftestuser4%252F20250820_162425.png&w=3840&q=75&dpl=dpl_2uGXzhZZsLneniBZtsxr7PEabQXN',
      9: 'https://tutor.mathkraft.org/_next/image?url=%2Fapi%2Fproxy%3Furl%3Dhttps%253A%252F%252Fd1ptidrpttdm41.cloudfront.net%252Ftestuser4%252F20250820_162551.png&w=3840&q=75&dpl=dpl_2uGXzhZZsLneniBZtsxr7PEabQXN',
      10: 'https://tutor.mathkraft.org/_next/image?url=%2Fapi%2Fproxy%3Furl%3Dhttps%253A%252F%252Fd1ptidrpttdm41.cloudfront.net%252Ftestuser4%252F20250820_162928.png&w=3840&q=75&dpl=dpl_2uGXzhZZsLneniBZtsxr7PEabQXN',
      11: 'https://tutor.mathkraft.org/_next/image?url=%2Fapi%2Fproxy%3Furl%3Dhttps%253A%252F%252Fd1ptidrpttdm41.cloudfront.net%252Ftestuser4%252F20250820_163018.png&w=3840&q=75&dpl=dpl_2uGXzhZZsLneniBZtsxr7PEabQXN',
      12: 'https://tutor.mathkraft.org/_next/image?url=%2Fapi%2Fproxy%3Furl%3Dhttps%253A%252F%252Fd1ptidrpttdm41.cloudfront.net%252Ftestuser4%252F20250820_163159.png&w=3840&q=75&dpl=dpl_2uGXzhZZsLneniBZtsxr7PEabQXN'
    };
    return pages.map(p => (staticImageMap[p.pageNumber] ? { ...p, imageUrl: staticImageMap[p.pageNumber] } : p));
  });
  
  // Audio state
  const [readToMeEnabled, setReadToMeEnabled] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Audio functions
  const stopCurrentAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  }, [currentAudio]);

  const generateAndPlayAudio = useCallback(async (text: string, forcePlay: boolean = false) => {
    if ((!readToMeEnabled && !forcePlay) || isGeneratingAudio || !text.trim()) return;

    // Always stop current audio before starting new one
    stopCurrentAudio();
    setIsGeneratingAudio(true);

    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text.trim(),
          voice_id: 'cgSgspJ2msm6clMCkdW9', // Jessica voice - good for children's stories
          speed: 0.9 // Slightly slower for story reading
        })
      });

      if (!response.ok) throw new Error('Failed to generate audio');
      
      const data = await response.json();
      
      const audio = new Audio(data.audioUrl);
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        console.error('Audio playback error');
      };
      
      setCurrentAudio(audio);
      
      // Only play if readToMe is still enabled (or forced)
      if (readToMeEnabled || forcePlay) {
        await audio.play();
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      setIsPlaying(false);
      setCurrentAudio(null);
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [readToMeEnabled, isGeneratingAudio, stopCurrentAudio]);

  const goToNextPage = () => {
    if (currentPage < pages.length - 1 && !isTransitioning) {
      stopCurrentAudio();
      setIsTransitioning(true);
      setTimeout(() => {
        const newPage = currentPage + 1;
        setCurrentPage(newPage);
        setIsTransitioning(false);
        
        // Auto-read new page if enabled
        const newPageData = pagesWithImages[newPage];
        if (readToMeEnabled && newPageData?.text) {
          setTimeout(() => generateAndPlayAudio(newPageData.text), 300);
        }
      }, 150);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0 && !isTransitioning) {
      stopCurrentAudio();
      setIsTransitioning(true);
      setTimeout(() => {
        const newPage = currentPage - 1;
        setCurrentPage(newPage);
        setIsTransitioning(false);
        
        // Auto-read new page if enabled
        const newPageData = pagesWithImages[newPage];
        if (readToMeEnabled && newPageData?.text) {
          setTimeout(() => generateAndPlayAudio(newPageData.text), 300);
        }
      }, 150);
    }
  };

  const currentPageData = pagesWithImages[currentPage];

  // Images are now static per page; no generation needed

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      stopCurrentAudio();
    };
  }, [stopCurrentAudio]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at center, #f4f3f0 0%, #e8e6e1 50%, #d4d2cd 100%)',
      fontFamily: '"Georgia", "Times New Roman", serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Ambient lighting effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at 50% 20%, rgba(255, 248, 220, 0.3) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Header with back button */}
      <div style={{
        width: '100%',
        maxWidth: '1400px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        position: 'relative',
        zIndex: 10
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'linear-gradient(135deg, #7a68c5 0%, #6a59b5 100%)',
            color: '#f9f7f4',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(122, 104, 197, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            transition: 'all 200ms ease',
            fontFamily: '"Quicksand", system-ui, sans-serif'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(122, 104, 197, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(122, 104, 197, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
          }}
        >
          ← Back to Library
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Read to Me Toggle */}
          <button
            onClick={() => {
              const newEnabled = !readToMeEnabled;
              setReadToMeEnabled(newEnabled);
              
              if (newEnabled && currentPageData?.text) {
                // Start reading current page when enabled (force play even before state updates)
                setTimeout(() => generateAndPlayAudio(currentPageData.text, true), 100);
              } else if (!newEnabled) {
                // Stop reading when disabled
                stopCurrentAudio();
              }
            }}
            style={{
              background: readToMeEnabled 
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : 'linear-gradient(135deg, #7a68c5 0%, #6a59b5 100%)',
              color: '#f9f7f4',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: readToMeEnabled
                ? '0 4px 12px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                : '0 4px 12px rgba(122, 104, 197, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              transition: 'all 200ms ease',
              fontFamily: '"Quicksand", system-ui, sans-serif',
              opacity: isGeneratingAudio ? 0.7 : 1
            }}
            disabled={isGeneratingAudio}
            onMouseEnter={(e) => {
              if (!isGeneratingAudio) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = readToMeEnabled
                  ? '0 6px 16px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  : '0 6px 16px rgba(122, 104, 197, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isGeneratingAudio) {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = readToMeEnabled
                  ? '0 4px 12px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  : '0 4px 12px rgba(122, 104, 197, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
              }
            }}
          >
            {isGeneratingAudio ? '🔄' : isPlaying ? '🔊' : readToMeEnabled ? '🎧' : '🔇'} Read to Me
          </button>

          {/* PDF Download Button */}
          <button
            onClick={() => window.print()}
            style={{
              background: 'linear-gradient(135deg, #7a68c5 0%, #6a59b5 100%)',
              color: '#f9f7f4',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(122, 104, 197, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              transition: 'all 200ms ease',
              fontFamily: '"Quicksand", system-ui, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(122, 104, 197, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(122, 104, 197, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
            }}
          >
            📖 Print Book
          </button>

          {/* Generate Images Button removed - static images are used now */}

          {/* Page indicator */}
          <div style={{
            background: 'rgba(249, 247, 244, 0.95)',
            borderRadius: '20px',
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#7a68c5',
            border: '1px solid rgba(122, 104, 197, 0.2)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            Page {currentPage + 1} of {pagesWithImages.length}
          </div>
        </div>
      </div>

      {/* Main book container */}
      <div style={{
        perspective: '2000px',
        position: 'relative',
        zIndex: 5,
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Book */}
        <div style={{
          display: 'flex',
          maxWidth: '1100px',
          height: '600px',
          position: 'relative',
          transform: 'rotateX(5deg) rotateY(0deg)',
          transformStyle: 'preserve-3d',
          filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.25))'
        }}>
          {/* Book spine/binding */}
          <div style={{
            width: '40px',
            height: '100%',
            background: 'linear-gradient(to right, #7a68c5 0%, #8a79d9 50%, #7a68c5 100%)',
            borderRadius: '12px 0 0 12px',
            position: 'relative',
            boxShadow: 'inset -10px 0 20px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            {/* Book spine decorative lines */}
            <div style={{
              width: '20px',
              height: '2px',
              background: '#f9f7f4',
              marginBottom: '8px',
              borderRadius: '1px'
            }} />
            <div style={{
              width: '20px',
              height: '1px',
              background: '#f9f7f4',
              opacity: 0.7,
              borderRadius: '1px'
            }} />
          </div>

          {/* Left page (image) */}
          <div style={{
            flex: '1',
            height: '100%',
            background: '#fefdfb',
            borderRadius: '0',
            position: 'relative',
            border: '1px solid #e8e6e1',
            borderLeft: 'none',
            borderRight: '1px solid #d4d2cd',
            overflow: 'hidden',
            transform: isTransitioning ? 'rotateY(-2deg)' : 'rotateY(0deg)',
            transition: 'transform 300ms ease',
            boxShadow: 'inset 20px 0 40px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Page texture */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(228, 225, 218, 0.3) 2px, rgba(228, 225, 218, 0.3) 3px)',
              pointerEvents: 'none'
            }} />

            {/* Previous page button */}
            {currentPage > 0 && (
              <button
                onClick={goToPrevPage}
                disabled={isTransitioning}
                style={{
                  position: 'absolute',
                  left: '20px',
                  bottom: '20px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: 'none',
                  background: isTransitioning
                    ? 'rgba(232, 230, 225, 0.8)'
                    : 'rgba(122, 104, 197, 0.9)',
                  color: isTransitioning ? '#7a68c5' : '#f9f7f4',
                  cursor: isTransitioning ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: '600',
                  boxShadow: isTransitioning
                    ? 'none'
                    : '0 4px 12px rgba(122, 104, 197, 0.3)',
                  transition: 'all 200ms ease',
                  zIndex: 10,
                  backdropFilter: 'blur(4px)'
                }}
                onMouseEnter={(e) => {
                  if (!isTransitioning) {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(122, 104, 197, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isTransitioning) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(122, 104, 197, 0.3)';
                  }
                }}
              >
                ◀
              </button>
            )}
            
            {/* Page content */}
            <div style={{
              padding: '40px 30px 40px 50px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {currentPageData?.imageUrl ? (
                <img 
                  src={currentPageData.imageUrl}
                  alt={`Page ${currentPage + 1} illustration`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '85%',
                  background: 'linear-gradient(135deg, #f4f3f0 0%, #e8e6e1 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7a68c5',
                  fontSize: '18px',
                  fontWeight: '500',
                  border: '2px dashed #d4d2cd',
                  fontFamily: '"Georgia", "Times New Roman", serif',
                  gap: '10px'
                }}>
                  <div style={{ fontSize: '14px', opacity: 0.7 }}>Illustration not available</div>
                </div>
              )}
            </div>
          </div>

          {/* Right page (text) */}
          <div style={{
            flex: '1',
            height: '100%',
            background: '#fefdfb',
            borderRadius: '0 12px 12px 0',
            position: 'relative',
            border: '1px solid #e8e6e1',
            borderLeft: 'none',
            overflow: 'hidden',
            transform: isTransitioning ? 'rotateY(2deg)' : 'rotateY(0deg)',
            transition: 'transform 300ms ease',
            boxShadow: 'inset -20px 0 40px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Page texture */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(228, 225, 218, 0.3) 2px, rgba(228, 225, 218, 0.3) 3px)',
              pointerEvents: 'none'
            }} />

            {/* Next page button */}
            {currentPage < pagesWithImages.length - 1 && (
              <button
                onClick={goToNextPage}
                disabled={isTransitioning}
                style={{
                  position: 'absolute',
                  right: '20px',
                  bottom: '20px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: 'none',
                  background: isTransitioning
                    ? 'rgba(232, 230, 225, 0.8)'
                    : 'rgba(122, 104, 197, 0.9)',
                  color: isTransitioning ? '#7a68c5' : '#f9f7f4',
                  cursor: isTransitioning ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: '600',
                  boxShadow: isTransitioning
                    ? 'none'
                    : '0 4px 12px rgba(122, 104, 197, 0.3)',
                  transition: 'all 200ms ease',
                  zIndex: 10,
                  backdropFilter: 'blur(4px)'
                }}
                onMouseEnter={(e) => {
                  if (!isTransitioning) {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(122, 104, 197, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isTransitioning) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(122, 104, 197, 0.3)';
                  }
                }}
              >
                ▶
              </button>
            )}
            
            {/* Page content */}
            <div style={{
              padding: '40px 50px 50px 30px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}>
              {/* Title and Author at top of right page */}
              <div style={{
                marginBottom: '30px',
                borderBottom: '1px solid #e8e6e1',
                paddingBottom: '20px'
              }}>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#7a68c5',
                  margin: '0 0 8px 0',
                  fontFamily: '"Georgia", "Times New Roman", serif',
                  textShadow: '0 1px 2px rgba(90, 74, 58, 0.1)',
                  letterSpacing: '-0.3px',
                  lineHeight: '1.2'
                }}>
                  {title}
                </h1>
                <p style={{
                  fontSize: '16px',
                  color: '#7a68c5',
                  margin: 0,
                  fontWeight: '400',
                  fontStyle: 'italic'
                }}>
                  {author}
                </p>
              </div>

              {/* Story text */}
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center'
              }}>
                <div style={{
                  fontSize: '20px',
                  lineHeight: '1.8',
                  color: '#3a312a',
                  fontWeight: '400',
                  textAlign: 'left',
                  fontFamily: '"Georgia", "Times New Roman", serif',
                  letterSpacing: '0.2px',
                  textShadow: '0 1px 2px rgba(58, 49, 42, 0.1)',
                  whiteSpace: 'pre-line'
                }}>
                  {currentPageData?.text || 'Story text will appear here...'}
                </div>
              </div>

              {/* Page number */}
              <div style={{
                position: 'absolute',
                bottom: '25px',
                right: '25px',
                fontSize: '14px',
                color: '#7a68c5',
                fontWeight: '500'
              }}>
                {currentPage + 1}
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
