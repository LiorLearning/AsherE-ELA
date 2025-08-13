import React from 'react';

type Props = {
  imageUrl?: string | null;
  loading?: boolean;
  error?: string | null;
  progress?: number; // 0..3
  headerText?: string;
  headerAvatar?: string; // emoji or small image url
  onListen?: () => void;
  footerCard?: React.ReactNode;
  centerCard?: React.ReactNode;
  overlay?: React.ReactNode;
};

export function ImagePanel({ imageUrl, loading, error, progress = 0, headerText, headerAvatar = '🗨️', onListen, footerCard, centerCard, overlay }: Props): JSX.Element {
  const segmentIcons = ['🌀','🤖'];

  return (
    <div style={{ position: 'relative', height: '100%', background: '#0f172a' }}>
      {/* Scene image */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {!imageUrl && !loading && !error && (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
            Your image will appear here
          </div>
        )}
        {loading && (
          <div style={{ height: '100%', display: 'grid', placeItems: 'center' }}>
            <div style={{ width: 220, height: 140, background: 'linear-gradient(90deg,#e5e7eb,#f3f4f6,#e5e7eb)', borderRadius: 16, animation: 'shimmer 1.2s infinite' as any }} />
          </div>
        )}
        {error && (
          <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#DC2626', background: '#FFF1F2' }}>{error}</div>
        )}
        {imageUrl && !loading && !error && (
          <img src={imageUrl} alt="Scene" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.05)', display: 'block' }} />
        )}
        {/* Subtle vignette for readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)' }} />
      </div>

      {/* Header question bar */}
      <div style={{ position: 'absolute', left: 16, right: 16, top: 16, display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(6px)', borderRadius: 18, padding: '14px 16px', boxShadow: '0 10px 28px rgba(0,0,0,0.18)' }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#FCE7F3', fontSize: 22 }}>{headerAvatar}</div>
          <div style={{ flex: 1, fontWeight: 900, color: '#111827', fontSize: 20, lineHeight: 1.2 }}>{headerText ?? 'Ready when you are!'}</div>
          <button onClick={onListen} aria-label="Listen" style={{ background: '#EEF2FF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '10px 12px', cursor: 'pointer', color: '#4338CA', fontWeight: 700 }}>Listen</button>
        </div>
        {/* Progress ribbon */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ flex: 1, height: 12, borderRadius: 999, background: i < progress ? '#10B981' : 'rgba(255,255,255,0.55)', position: 'relative', overflow: 'hidden' }}>
              <span style={{ position: 'absolute', insetInlineStart: 8, insetBlockStart: -1, fontSize: 14 }}>{segmentIcons[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Center interactive card for big buttons */}
      {centerCard && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: 'min(860px, 92%)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(6px)', border: '1px solid #E5E7EB', borderRadius: 20, padding: 20, boxShadow: '0 24px 60px rgba(2,6,23,0.35)' }}>
            {centerCard}
          </div>
        </div>
      )}

      {/* Bottom floating helper card (used when idle) */}
      {!centerCard && (
        <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, padding: 14, boxShadow: '0 14px 40px rgba(2,6,23,0.25)' }}>
            {footerCard ?? <div style={{ color: '#6B7280' }}>Click Create Image to begin.</div>}
          </div>
        </div>
      )}

      {/* Overlay for completion */}
      {overlay && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 20, minWidth: 260, textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>
            {overlay}
          </div>
        </div>
      )}
    </div>
  );
}


