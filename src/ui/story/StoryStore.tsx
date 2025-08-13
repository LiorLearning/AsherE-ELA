import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

// Versioned local storage key to allow future migrations without breaking users
const STORAGE_KEY = 'story:current:v1';

export type StoryMessage = {
  role: 'ai' | 'student';
  text: string;
  isImage?: boolean;
  isLoading?: boolean;
  imageUrl?: string | null;
  timestamp?: number;
};

type StoryMetadata = {
  protagonist?: string;
  sidekick?: string;
  setting?: string;
  goal?: string;
};

type GeneratedArtifacts = {
  step2Passage?: string;
  hooksByStep?: Record<string, string>;
  pendingAdventureChat?: { text: string; ts: number };
};

export type StoryState = {
  adventureMessages: StoryMessage[];
  storyEvents: string[];
  metadata: StoryMetadata;
  generated: GeneratedArtifacts;
  updatedAt: number;
};

const initialState: StoryState = {
  adventureMessages: [],
  storyEvents: [],
  metadata: {},
  generated: {},
  updatedAt: Date.now(),
};

type StoryContextValue = {
  state: StoryState;
  appendMessage: (message: StoryMessage | Omit<StoryMessage, 'timestamp'>) => void;
  appendEvent: (eventText: string) => void;
  setMetadata: (partial: Partial<StoryMetadata>) => void;
  setStep2Passage: (passage: string) => void;
  setHookForStep: (stepId: string, text: string) => void;
  setPendingAdventureChat: (text: string) => void;
  consumePendingAdventureChat: () => { text: string; ts: number } | undefined;
  reset: () => void;
};

const StoryContext = createContext<StoryContextValue | undefined>(undefined);

function safeLoad(): StoryState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as StoryState;
    // Very lightweight validation
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.adventureMessages)) {
      return initialState;
    }
    return { ...initialState, ...parsed };
  } catch {
    return initialState;
  }
}

function safeSave(state: StoryState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore persistence errors to avoid disrupting UX
  }
}

export function StoryProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [state, setState] = useState<StoryState>(() => safeLoad());

  // Simple debounce to avoid excessive writes on rapid updates
  const saveTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      safeSave(state);
    }, 120);
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [state]);

  const appendMessage = useCallback((message: StoryMessage | Omit<StoryMessage, 'timestamp'>) => {
    setState(prev => ({
      ...prev,
      adventureMessages: [
        ...prev.adventureMessages,
        { timestamp: Date.now(), imageUrl: null, ...message },
      ].slice(-200),
      updatedAt: Date.now(),
    }));
  }, []);

  const appendEvent = useCallback((eventText: string) => {
    if (!eventText || !eventText.trim()) return;
    setState(prev => ({
      ...prev,
      storyEvents: [...prev.storyEvents, eventText].slice(-200),
      updatedAt: Date.now(),
    }));
  }, []);

  const setMetadata = useCallback((partial: Partial<StoryMetadata>) => {
    setState(prev => ({
      ...prev,
      metadata: { ...prev.metadata, ...partial },
      updatedAt: Date.now(),
    }));
  }, []);

  const setStep2Passage = useCallback((passage: string) => {
    setState(prev => ({
      ...prev,
      generated: { ...prev.generated, step2Passage: passage },
      updatedAt: Date.now(),
    }));
  }, []);

  const setHookForStep = useCallback((stepId: string, text: string) => {
    if (!stepId || !text) return;
    setState(prev => ({
      ...prev,
      generated: {
        ...prev.generated,
        hooksByStep: { ...(prev.generated.hooksByStep || {}), [stepId]: text },
      },
      updatedAt: Date.now(),
    }));
  }, []);

  const setPendingAdventureChat = useCallback((text: string) => {
    if (!text || !text.trim()) return;
    setState(prev => ({
      ...prev,
      generated: { ...prev.generated, pendingAdventureChat: { text: text.trim(), ts: Date.now() } },
      updatedAt: Date.now(),
    }));
  }, []);

  const consumePendingAdventureChat = useCallback((): { text: string; ts: number } | undefined => {
    let pending: { text: string; ts: number } | undefined;
    setState(prev => {
      pending = prev.generated.pendingAdventureChat;
      if (!pending) return prev;
      return {
        ...prev,
        generated: { ...prev.generated, pendingAdventureChat: undefined },
        updatedAt: Date.now(),
      };
    });
    return pending;
  }, []);

  const reset = useCallback(() => {
    setState({ ...initialState, updatedAt: Date.now() });
  }, []);

  const value = useMemo<StoryContextValue>(() => ({
    state,
    appendMessage,
    appendEvent,
    setMetadata,
    setStep2Passage,
    setHookForStep,
    setPendingAdventureChat,
    consumePendingAdventureChat,
    reset,
  }), [state, appendMessage, appendEvent, setMetadata, setStep2Passage, setHookForStep, setPendingAdventureChat, consumePendingAdventureChat, reset]);

  return (
    <StoryContext.Provider value={value}>
      {children}
    </StoryContext.Provider>
  );
}

export function useStory(): StoryContextValue {
  const ctx = useContext(StoryContext);
  if (!ctx) throw new Error('useStory must be used within a StoryProvider');
  return ctx;
}


