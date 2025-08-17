import { BlendingQuestion, SpeechQuestion, Question } from './types';

export const blendingQuestions: BlendingQuestion[] = [
  {
    id: 1,
    word: 'Sparkle',
    imageUrl: '✨👩‍🚀',
    phonemes: ['sp', 'ar', 'k', 'le'],
    explanation: "Blend the sounds sp-ar-k-le to make 'Sparkle'!",
  },
];

export const speechQuestions: SpeechQuestion[] = [
  {
    id: 1,
    text:
      "Amazing! Sparkle just saved Earth AND the alien planet! The grateful aliens threw a huge celebration with sparkles everywhere. Now it's time to explore their magical world. Sparkle and her friend ride on the back of a gentle space whale through purple clouds. Below them, they see a massive crystal cave filled with glowing treasure. 'Let's make this place our new home base!' says Sparkle excitedly. But suddenly, they notice strange smoke rising from a distant mountain...",
    imageUrl: '✨🌙👽💎🌍',
    expectedWords: ['huge', 'time', 'ride', 'space', 'place'],
    explanation: 'Fantastic reading! You captured all the exciting silent e words in the celebration adventure.',
  },
];

export const longAQuestions: Question[] = [
  {
    id: 1,
    word: 'gate',
    imageUrl: '🚪✨',
    isSpelling: true,
    correctAnswer: 'gate',
    explanation: 'A shimmering starlight "gate" opens - the long a sound with silent e!',
    aiHook: {
      targetWord: 'gate',
      intent: 'spelling',
      baseLine: 'A shimmering starlight doorway appears in the cavern wall. The baby alien points to the glowing opening.',
      questionLine: 'Listen and type the long a word for the opening.',
      validationWord: 'gate',
      imagePrompt: 'Epic close-up of a glowing sci‑fi doorway in Sprinkle Chip Caverns on the Moon, purple rocks, sparkles drifting, friendly baby alien pointing, clearly shows a magical gate/door entrance; kid-safe, cinematic, vivid.'
    }
  },
  {
    id: 2,
    word: 'aim',
    imageUrl: '🎯⚡',
    isSpelling: true,
    correctAnswer: 'aim',
    explanation: 'Sparkle must "aim" the beam exactly - the long a sound with ai!',
    aiHook: {
      targetWord: 'aim',
      intent: 'spelling',
      baseLine: 'To power the crystal switch, Sparkle must point the beam exactly at the center.',
      questionLine: 'Listen and type the long a word for what Sparkle must do.',
      validationWord: 'aim',
      imagePrompt: 'Sparkle in a pink astronaut suit carefully aiming a glowing starlight beam at a crystal target inside a lunar cavern; focus on the "aiming" act (pose/hand/beam alignment).'
    }
  },
];

export const questions: Question[] = [
  {
    id: 1,
    word: 'space',
    imageUrl: '🌌🚀',
    isSpelling: true,
    correctAnswer: 'space',
    explanation: 'They drift through silent "space" - the long a sound with silent e!',
    aiHook: {
      targetWord: 'space',
      intent: 'spelling',
      baseLine: 'With Earth safe, they drift through the silent dark toward the alien planet.',
      questionLine: 'Listen and type the long a word for where they are traveling.',
      validationWord: 'space',
      imagePrompt: 'Wide shot of Sparkle and friend floating in outer space with Earth glowing in the background, stars and nebulae; clearly conveys vast SPACE with kid-friendly wonder.'
    }
  },
  {
    id: 2,
    word: 'cave',
    imageUrl: '🕳️✨',
    isSpelling: true,
    correctAnswer: 'cave',
    explanation: 'Sparkle and her friend step into a glowing "cave" - the long a sound with silent e!',
    aiHook: {
      targetWord: 'cave',
      intent: 'spelling',
      baseLine: 'The baby alien points at the safe hiding place in the Moon\'s rock.',
      questionLine: 'Listen and type the long a word for the hollow.',
      validationWord: 'cave',
      imagePrompt: 'Moon cavern entrance glowing with crystals and stardust, Sparkle entering with small alien; composition highlights the CAVE mouth clearly.'
    }
  },
  {
    id: 3,
    word: 'trail',
    imageUrl: '✨🛤️',
    isSpelling: true,
    correctAnswer: 'trail',
    explanation: 'The baby alien leaves a sparkly "trail" - the long a sound with ai!',
    aiHook: {
      targetWord: 'trail',
      intent: 'spelling',
      baseLine: 'The baby alien leaves sparkly stardust behind them as they hurry to plan how to save the alien planet.',
      questionLine: 'Listen and type the long a word for a path left behind.',
      validationWord: 'trail',
      imagePrompt: 'Curving TRAIL of glowing stardust footprints across lunar dust leading to Sparkle and the baby alien; the path shape is unmistakable.'
    }
  },
  {
    id: 4,
    word: 'ray',
    imageUrl: '🌟💙',
    isSpelling: true,
    correctAnswer: 'ray',
    explanation: 'A soft blue "ray" of light from Earth - the long a sound with ay!',
    aiHook: {
      targetWord: 'ray',
      intent: 'spelling',
      baseLine: 'A soft blue light from Earth shines across the caverns as Sparkle lifts her pink visor.',
      questionLine: 'Listen and type the long a word for a thin beam of light.',
      validationWord: 'ray',
      imagePrompt: 'Single thin RAY of soft blue light cutting through a dim crystal cavern toward Sparkle; composition emphasizes the beam as the subject.'
    }
  },
];

export const options: string[] = ['th', 'ch', 'fr'];


