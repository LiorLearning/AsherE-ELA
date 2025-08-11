import React, { useEffect, useRef, useState } from 'react';
import { createOrGetGame, attachToParent, detachGameFromParent } from '../webgame/phaserGame';

export function GamePanel(): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    const parentId = attachToParent(containerRef.current);
    createOrGetGame(parentId);
    return () => {
      detachGameFromParent();
    };
  }, [started]);

  if (!started) {
    return (
      <div style={{ height: '100%', padding: 32, overflow: 'auto' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: '#4338CA' }}>Multiplying Monomials and Binomials</div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 24, padding: 32, boxShadow: '0 10px 30px rgba(17,24,39,0.06)' }}>
            <div style={{ textAlign: 'center', color: '#6B7280', marginBottom: 16 }}>Today we'll learn to multiply:</div>
            <div style={{ textAlign: 'center', fontSize: 44, fontWeight: 800, color: '#1F2937', marginBottom: 8 }}>3x(2x - 1)</div>
            <div style={{ textAlign: 'center', color: '#6B7280', marginBottom: 28 }}>Using the area model approach</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => setStarted(true)} style={{
                background: '#4F46E5', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 22px',
                fontWeight: 700, boxShadow: '0 8px 20px rgba(79,70,229,0.25)', cursor: 'pointer'
              }}>Let's Start!</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', background: '#F3F4F6' }} />
  );
}


