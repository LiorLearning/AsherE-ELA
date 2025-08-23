import React, { useState, useCallback } from 'react';

type ImageSlot = {
  id: string;
  label: string;
  imageUrl?: string;
  hasImage: boolean;
};

type Props = {
  onBack: () => void;
  onNext?: () => void;
};

export function AsherPictureBook({ onBack, onNext }: Props): JSX.Element {
  // Character and scene image state
  const [characterImages, setCharacterImages] = useState<ImageSlot[]>([
    { id: 'captain-asher', label: 'Captain Asher', hasImage: false },
    { id: 'sidekick-1', label: 'Sidekick 1', hasImage: true, imageUrl: 'https://d1ptidrpttdm41.cloudfront.net/AsherE/20250815_174915.png' },
    { id: 'sidekick-2', label: 'Sidekick 2', hasImage: false }
  ]);

  const [baseImages, setBaseImages] = useState<ImageSlot[]>([
    { id: 'home-base', label: 'Home Base', hasImage: false }
  ]);

  const [villainImages, setVillainImages] = useState<ImageSlot[]>([
    { id: 'villain-1', label: 'Villain 1', hasImage: false }
  ]);

  const [sceneImages, setSceneImages] = useState<ImageSlot[]>([
    { 
      id: 'scene-1', 
      label: 'Scene 1', 
      hasImage: true, 
      imageUrl: 'https://tutor.mathkraft.org/_next/image?url=%2Fapi%2Fproxy%3Furl%3Dhttps%253A%252F%252Fd1ptidrpttdm41.cloudfront.net%252FAsherE%252F20250815_172218.png&w=3840&q=75&dpl=dpl_2uGXzhZZsLneniBZtsxr7PEabQXN'
    },
    { 
      id: 'scene-2', 
      label: 'Scene 2', 
      hasImage: true, 
      imageUrl: 'https://tutor.mathkraft.org/_next/image?url=%2Fapi%2Fproxy%3Furl%3Dhttps%253A%252F%252Fd1ptidrpttdm41.cloudfront.net%252FAsherE%252F20250815_173728.png&w=3840&q=75&dpl=dpl_2uGXzhZZsLneniBZtsxr7PEabQXN'
    },
    { 
      id: 'scene-3', 
      label: 'Scene 3', 
      hasImage: true, 
      imageUrl: 'https://tutor.mathkraft.org/_next/image?url=%2Fapi%2Fproxy%3Furl%3Dhttps%253A%252F%252Fd1ptidrpttdm41.cloudfront.net%252FAsherE%252F20250815_174411.png&w=3840&q=75&dpl=dpl_2uGXzhZZsLneniBZtsxr7PEabQXN'
    },
    { id: 'scene-4', label: 'Scene 4', hasImage: false },
    { id: 'scene-5', label: 'Scene 5', hasImage: false },
    { id: 'scene-6', label: 'Scene 6', hasImage: false }
  ]);

  const addCharacterSlot = useCallback(() => {
    const newId = `sidekick-${characterImages.length}`;
    const newLabel = `Sidekick ${characterImages.length}`;
    setCharacterImages(prev => [...prev, { id: newId, label: newLabel, hasImage: false }]);
  }, [characterImages.length]);

  const addBaseSlot = useCallback(() => {
    const newId = `base-${baseImages.length + 1}`;
    const newLabel = `Base ${baseImages.length + 1}`;
    setBaseImages(prev => [...prev, { id: newId, label: newLabel, hasImage: false }]);
  }, [baseImages.length]);

  const addVillainSlot = useCallback(() => {
    const newId = `villain-${villainImages.length + 1}`;
    const newLabel = `Villain ${villainImages.length + 1}`;
    setVillainImages(prev => [...prev, { id: newId, label: newLabel, hasImage: false }]);
  }, [villainImages.length]);

  const addSceneSlot = useCallback(() => {
    const newId = `scene-${sceneImages.length + 1}`;
    const newLabel = `Scene ${sceneImages.length + 1}`;
    setSceneImages(prev => [...prev, { id: newId, label: newLabel, hasImage: false }]);
  }, [sceneImages.length]);

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [currentGeneratingId, setCurrentGeneratingId] = useState<string | null>(null);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const generateImage = useCallback(async (id: string, label: string, action: 'add' | 'replace') => {
    setIsGeneratingImage(true);
    setCurrentGeneratingId(id);

    try {
      let prompt = '';
      
      // Generate appropriate prompts based on the slot [[memory:7038524]]
      if (id === 'captain-asher') {
        prompt = 'Captain Asher, a young boy in a futuristic space suit with glowing neon accents, heroic pose, sci-fi adventure style, digital art';
      } else if (id === 'sidekick-1') {
        prompt = 'Clay, a massive brown MudWing dragon with warm amber eyes, friendly dragon sidekick, space adventure setting, digital art';
      } else if (id === 'sidekick-2') {
        prompt = 'Shracker, a sleek metallic robotic bird with glowing sensors, futuristic tech companion, space adventure style, digital art';
      } else if (id === 'home-base') {
        prompt = 'Underground starbase beneath alien jungle vines on Ragonia 7 moon, futuristic sci-fi base, glowing technology, space adventure setting, digital art';
      } else if (id.startsWith('villain-')) {
        prompt = 'The Time Stranglers, menacing futuristic villains, dark sci-fi antagonists, space adventure setting, alien technology, digital art';
      } else if (id.startsWith('scene-')) {
        const sceneNumber = id.split('-')[1];
        prompt = `Captain Asher adventure scene ${sceneNumber}, futuristic jungle on Ragonia 7 moon, space exploration, Time Stranglers, alien technology, sci-fi adventure, digital art`;
      }

      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          style: 'digital-art',
          size: '1024x1024'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      const newImageUrl = data.imageUrl;

      // Update the appropriate state based on the slot type
      if (id === 'captain-asher' || id.startsWith('sidekick-')) {
        setCharacterImages(prev => prev.map(img => 
          img.id === id 
            ? { ...img, hasImage: true, imageUrl: newImageUrl }
            : img
        ));
      } else if (id.startsWith('home-base')) {
        setBaseImages(prev => prev.map(img => 
          img.id === id 
            ? { ...img, hasImage: true, imageUrl: newImageUrl }
            : img
        ));
      } else if (id.startsWith('villain-')) {
        setVillainImages(prev => prev.map(img => 
          img.id === id 
            ? { ...img, hasImage: true, imageUrl: newImageUrl }
            : img
        ));
      } else if (id.startsWith('scene-')) {
        setSceneImages(prev => prev.map(img => 
          img.id === id 
            ? { ...img, hasImage: true, imageUrl: newImageUrl }
            : img
        ));
      }

    } catch (error) {
      console.error('Error generating image:', error);
      // You could add error handling UI here
    } finally {
      setIsGeneratingImage(false);
      setCurrentGeneratingId(null);
    }
  }, []);

  const handleEditName = useCallback((id: string, newName: string) => {
    if (id === 'captain-asher' || id.startsWith('sidekick-')) {
      setCharacterImages(prev => prev.map(img => 
        img.id === id ? { ...img, label: newName } : img
      ));
    } else if (id.startsWith('home-base') || id === 'home-base') {
      setBaseImages(prev => prev.map(img => 
        img.id === id ? { ...img, label: newName } : img
      ));
    } else if (id.startsWith('villain-')) {
      setVillainImages(prev => prev.map(img => 
        img.id === id ? { ...img, label: newName } : img
      ));
    } else if (id.startsWith('scene-')) {
      setSceneImages(prev => prev.map(img => 
        img.id === id ? { ...img, label: newName } : img
      ));
    }
    setEditingSlot(null);
    setEditingName('');
  }, []);

  const handleDeleteImage = useCallback((id: string) => {
    if (id === 'captain-asher' || id.startsWith('sidekick-')) {
      setCharacterImages(prev => prev.map(img => 
        img.id === id ? { ...img, hasImage: false, imageUrl: undefined } : img
      ));
    } else if (id.startsWith('home-base') || id === 'home-base') {
      setBaseImages(prev => prev.map(img => 
        img.id === id ? { ...img, hasImage: false, imageUrl: undefined } : img
      ));
    } else if (id.startsWith('villain-')) {
      setVillainImages(prev => prev.map(img => 
        img.id === id ? { ...img, hasImage: false, imageUrl: undefined } : img
      ));
    } else if (id.startsWith('scene-')) {
      setSceneImages(prev => prev.map(img => 
        img.id === id ? { ...img, hasImage: false, imageUrl: undefined } : img
      ));
    }
    setEditingSlot(null);
    setEditingName('');
  }, []);

  const startEditing = useCallback((slot: ImageSlot) => {
    setEditingSlot(slot.id);
    setEditingName(slot.label);
  }, []);

  const handleFileUpload = useCallback((id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      
      // Update the appropriate state based on the slot type
      if (id === 'captain-asher' || id.startsWith('sidekick-')) {
        setCharacterImages(prev => prev.map(img => 
          img.id === id 
            ? { ...img, hasImage: true, imageUrl }
            : img
        ));
      } else if (id.startsWith('home-base')) {
        setBaseImages(prev => prev.map(img => 
          img.id === id 
            ? { ...img, hasImage: true, imageUrl }
            : img
        ));
      } else if (id.startsWith('villain-')) {
        setVillainImages(prev => prev.map(img => 
          img.id === id 
            ? { ...img, hasImage: true, imageUrl }
            : img
        ));
      } else if (id.startsWith('scene-')) {
        setSceneImages(prev => prev.map(img => 
          img.id === id 
            ? { ...img, hasImage: true, imageUrl }
            : img
        ));
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const ImageSlotComponent = ({ 
    slot, 
    width = 300, 
    height = 200 
  }: { 
    slot: ImageSlot; 
    width?: number; 
    height?: number; 
  }) => {
    const isGenerating = currentGeneratingId === slot.id;
    const isEditing = editingSlot === slot.id;
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        position: 'relative'
      }}>
        <div style={{
          width,
          height,
          borderRadius: 16,
          background: slot.hasImage && slot.imageUrl 
            ? 'transparent'
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          border: '2px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          {/* Delete Button - only show when editing and has image */}
          {isEditing && slot.hasImage && (
            <button
              onClick={() => handleDeleteImage(slot.id)}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(220, 38, 38, 0.9)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                color: 'white',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
                transition: 'all 200ms ease',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(185, 28, 28, 0.95)';
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(220, 38, 38, 0.9)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
              }}
            >
              🗑️
            </button>
          )}

          {/* Subtle edit button on bottom right */}
          <button
            onClick={() => startEditing(slot)}
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'rgba(107, 114, 128, 0.1)',
              border: '1px solid rgba(107, 114, 128, 0.2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: '#6b7280',
              transition: 'all 200ms ease',
              opacity: 0.6,
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.background = 'rgba(107, 114, 128, 0.15)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.6';
              e.currentTarget.style.background = 'rgba(107, 114, 128, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✏️
          </button>

          {slot.hasImage && slot.imageUrl && (
            <img 
              src={slot.imageUrl}
              alt={slot.label}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: 14
              }}
            />
          )}
          {!slot.hasImage && !isGenerating && (
            <>
              {/* File input for upload */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(slot.id, file);
                  }
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                  zIndex: 5
                }}
              />
              
              {/* + sign in center */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                pointerEvents: 'none'
              }}>
                <div style={{
                  fontSize: 48,
                  color: '#9ca3af',
                  fontWeight: 300,
                  lineHeight: 1
                }}>
                  +
                </div>
                <div style={{
                  fontSize: 14,
                  color: '#9ca3af',
                  fontWeight: 500,
                  fontFamily: 'Quicksand, system-ui, sans-serif'
                }}>
                  Click to Upload
                </div>
              </div>
            </>
          )}
          
          {isGenerating && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              color: '#6b7280',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'Quicksand, system-ui, sans-serif'
            }}>
              <div style={{
                width: 32,
                height: 32,
                border: '3px solid #e5e7eb',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Generating...
            </div>
          )}
        </div>
        

        
        {isEditing ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleEditName(slot.id, editingName);
                } else if (e.key === 'Escape') {
                  setEditingSlot(null);
                  setEditingName('');
                }
              }}
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#374151',
                fontFamily: 'Quicksand, system-ui, sans-serif',
                textAlign: 'center',
                border: '2px solid #3b82f6',
                borderRadius: 8,
                padding: '4px 8px',
                background: 'white',
                outline: 'none',
                minWidth: 120
              }}
              autoFocus
            />
            <button
              onClick={() => handleEditName(slot.id, editingName)}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#10b981',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12
              }}
            >
              ✓
            </button>
            <button
              onClick={() => {
                setEditingSlot(null);
                setEditingName('');
              }}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#ef4444',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <h3 style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: '#374151',
            fontFamily: 'Quicksand, system-ui, sans-serif',
            textAlign: 'center'
          }}>
            {slot.label}
          </h3>
        )}
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      <div style={{
        minHeight: '100vh',
        background: 'white',
        fontFamily: 'Quicksand, system-ui, sans-serif'
      }}>
        {/* Colored Header Bar */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          padding: '32px',
          marginBottom: 32
        }}>
          <div style={{
            maxWidth: 1400,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h1 style={{
              fontSize: 48,
              fontWeight: 700,
              color: 'white',
              margin: 0,
              fontFamily: 'Quicksand, system-ui, sans-serif'
            }}>
              Asher's World
            </h1>
            
            <button
              onClick={onBack}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 600,
                fontFamily: 'Quicksand, system-ui, sans-serif',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'all 200ms ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
            >
              ← Back to Library
            </button>
          </div>
        </div>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 32px'
        }}>

          {/* Characters Section */}
          <div style={{ marginBottom: 64 }}>
            <h2 style={{
              fontSize: 36,
              fontWeight: 700,
              color: '#1f2937',
              margin: '0 0 32px 0',
              fontFamily: 'Quicksand, system-ui, sans-serif'
            }}>
              Asher and Sidekicks
            </h2>
            
            <div style={{
              display: 'flex',
              gap: 40,
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              alignItems: 'flex-start'
            }}>
              {characterImages.map((slot) => (
                <ImageSlotComponent 
                  key={slot.id} 
                  slot={slot} 
                  width={280} 
                  height={200} 
                />
              ))}
              
              {/* Add More Button */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16
              }}>
                <div style={{
                  width: 280,
                  height: 200,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  border: '2px dashed #d1d5db',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
                onClick={addCharacterSlot}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#9ca3af';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
                }}>
                  <div style={{
                    fontSize: 48,
                    color: '#9ca3af',
                    fontWeight: 300
                  }}>
                    +
                  </div>
                </div>
                
                <div style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'transparent',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'Quicksand, system-ui, sans-serif',
                  color: '#6b7280'
                }}>
                  Add More
                </div>
                
                <h3 style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#9ca3af',
                  fontFamily: 'Quicksand, system-ui, sans-serif',
                  textAlign: 'center'
                }}>
                  
                </h3>
              </div>
            </div>
          </div>

          {/* Base Section */}
          <div style={{ marginBottom: 48 }}>
            <h2 style={{
              fontSize: 36,
              fontWeight: 700,
              color: '#1f2937',
              margin: '0 0 32px 0',
              fontFamily: 'Quicksand, system-ui, sans-serif'
            }}>
              Base
            </h2>
            
            <div style={{
              display: 'flex',
              gap: 40,
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              alignItems: 'flex-start'
            }}>
              {baseImages.map((slot) => (
                <ImageSlotComponent 
                  key={slot.id} 
                  slot={slot} 
                  width={280} 
                  height={200} 
                />
              ))}
              
              {/* Add More Button */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16
              }}>
                <div style={{
                  width: 280,
                  height: 200,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  border: '2px dashed #d1d5db',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
                onClick={addBaseSlot}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#9ca3af';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
                }}>
                  <div style={{
                    fontSize: 48,
                    color: '#9ca3af',
                    fontWeight: 300
                  }}>
                    +
                  </div>
                </div>
                
                <div style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'transparent',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'Quicksand, system-ui, sans-serif',
                  color: '#6b7280'
                }}>
                  Add More
                </div>
                
                <h3 style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#9ca3af',
                  fontFamily: 'Quicksand, system-ui, sans-serif',
                  textAlign: 'center'
                }}>
                  
                </h3>
              </div>
            </div>
          </div>

          {/* Villain Section */}
          <div style={{ marginBottom: 48 }}>
            <h2 style={{
              fontSize: 36,
              fontWeight: 700,
              color: '#1f2937',
              margin: '0 0 32px 0',
              fontFamily: 'Quicksand, system-ui, sans-serif'
            }}>
              Villains
            </h2>
            
            <div style={{
              display: 'flex',
              gap: 40,
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              alignItems: 'flex-start'
            }}>
              {villainImages.map((slot) => (
                <ImageSlotComponent 
                  key={slot.id} 
                  slot={slot} 
                  width={280} 
                  height={200} 
                />
              ))}
              
              {/* Add More Button */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16
              }}>
                <div style={{
                  width: 280,
                  height: 200,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  border: '2px dashed #d1d5db',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
                onClick={addVillainSlot}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#9ca3af';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
                }}>
                  <div style={{
                    fontSize: 48,
                    color: '#9ca3af',
                    fontWeight: 300
                  }}>
                    +
                  </div>
                </div>
                
                <div style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'transparent',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'Quicksand, system-ui, sans-serif',
                  color: '#6b7280'
                }}>
                  Add More
                </div>
                
                <h3 style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#9ca3af',
                  fontFamily: 'Quicksand, system-ui, sans-serif',
                  textAlign: 'center'
                }}>
                  
                </h3>
              </div>
            </div>
          </div>

          {/* Story Scenes Section */}
          <div style={{ marginBottom: 48 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 32
            }}>
              <h2 style={{
                fontSize: 36,
                fontWeight: 700,
                color: '#1f2937',
                margin: 0,
                fontFamily: 'Quicksand, system-ui, sans-serif'
              }}>
                Story Scenes
              </h2>
              
              <p style={{
                fontSize: 16,
                color: '#6b7280',
                margin: 0,
                fontStyle: 'italic'
              }}>
                Add images to blank scenes.
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              gap: 32,
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              alignItems: 'flex-start'
            }}>
              {sceneImages.map((slot) => (
                <ImageSlotComponent 
                  key={slot.id} 
                  slot={slot} 
                  width={320} 
                  height={240} 
                />
              ))}
              
              {/* Add More Button */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16
              }}>
                <div style={{
                  width: 320,
                  height: 240,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  border: '2px dashed #d1d5db',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
                onClick={addSceneSlot}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#9ca3af';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
                }}>
                  <div style={{
                    fontSize: 40,
                    color: '#9ca3af',
                    fontWeight: 300
                  }}>
                    +
                  </div>
                </div>
                
                <div style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'transparent',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'Quicksand, system-ui, sans-serif',
                  color: '#6b7280'
                }}>
                  Add More
                </div>
                
                <h3 style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#9ca3af',
                  fontFamily: 'Quicksand, system-ui, sans-serif',
                  textAlign: 'center'
                }}>
                  
                </h3>
              </div>
            </div>
          </div>

          {/* Tip */}
          <div style={{
            textAlign: 'center',
            padding: 32,
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: 16,
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <p style={{
              fontSize: 16,
              color: '#374151',
              margin: 0,
              fontStyle: 'italic'
            }}>
              Tip: Click any blank slot to add an image.
            </p>
          </div>
        </div>

        {/* Next Button - Fixed Position Bottom Right */}
        {onNext && (
          <button
            onClick={onNext}
            style={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              padding: '16px 24px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 600,
              fontFamily: 'Quicksand, system-ui, sans-serif',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
              transition: 'all 200ms ease',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
            }}
          >
            Next →
          </button>
        )}
      </div>
    </>
  );
}
