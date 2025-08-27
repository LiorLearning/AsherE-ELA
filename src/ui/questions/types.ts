export type AiHook = {
  targetWord: string;
  intent: 'sound' | 'spelling' | 'story' | 'spacing' | 'sorting';
  baseLine: string;
  questionLine: string;
  validationWord: string;
  // Optional per-question image prompt to steer DALL·E generation
  // If omitted, a contextual prompt will be composed from the adventure story
  // and the target word so the generated image clearly depicts the word.
  imagePrompt?: string;
};

export type Question = {
  id: number;
  word: string;
  imageUrl: string;
  correctAnswer: number | string | {[key: string]: string[]}; // index of correct option, correct spelling, or sorting groups
  explanation: string;
  isSpelling?: boolean; // Optional flag for spelling questions
  isSpacing?: boolean; // Optional flag for spacing questions
  isSorting?: boolean; // Optional flag for sorting questions
  isFillBlank?: boolean; // Optional flag for fill-in-the-blank questions
  fillBlankPattern?: string; // Pattern like "r__n" for fill-in-the-blank
  options?: string[]; // Optional answer choices for multiple choice questions
  sortingWords?: string[]; // Words to be sorted
  sortingBins?: string[]; // Bin labels for sorting
  aiHook?: AiHook; // Optional AI hook config for Step 5 methodology
};

export type BlendingQuestion = {
  id: number;
  word: string;
  imageUrl: string;
  phonemes: string[]; // individual sounds for blending
  explanation: string;
};

export type SpeechQuestion = {
  id: number;
  text: string;
  imageUrl: string;
  expectedWords: string[]; // words the student should say
  explanation: string;
};


