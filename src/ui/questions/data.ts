import { BlendingQuestion, SpeechQuestion, Question } from './types';

export const blendingQuestions: BlendingQuestion[] = [
  {
    id: 1,
    word: 'Stella',
    imageUrl: '🌟🌲',
    phonemes: ['St', 'e', 'lla'],
    explanation: "Blend the sounds St-e-lla to make 'Stella'!",
  },
];

export const speechQuestions: SpeechQuestion[] = [
  {
    id: 1,
    text:
      "Stella found a big stick on the forest path. She picked it up and gave it a quick hit against a tree. The stick made a loud sound that echoed through the woods.",
    imageUrl: '🌲🪵✨',
    expectedWords: ['big', 'stick', 'hit'],
    explanation: 'Great job! You found all the short i CVC words in Stella\'s forest adventure.',
  },
];

export const longAQuestions: Question[] = [
  {
    id: 1,
    word: 'Sort the words by their vowel patterns',
    imageUrl: '🔤✨',
    isSorting: true,
    correctAnswer: {
      'ay': ['may', 'gray'],
      'a_e': ['cave', 'shake']
    },
    explanation: 'Perfect! You sorted the magical word-stones by their long A patterns - ay and a_e!',
    sortingWords: ['may', 'cave', 'shake', 'gray'],
    sortingBins: ['ay', 'a_e'],
    aiHook: {
      targetWord: 'long A patterns',
      intent: 'sorting',
      baseLine: 'Deep in the enchanted forest, Stella discovers an ancient stone tablet with magical runes that spell different words. The wise fox explains that to unlock the next path, she must sort the glowing word-stones by their hidden patterns.',
      questionLine: 'Sort the words by their vowel patterns.',
      validationWord: 'vowel patterns',
      imagePrompt: 'Stella standing before a mystical stone sorting altar in the enchanted forest, with glowing word-stones floating around her showing "may", "cave", "shake", "gray", two magical sorting bins labeled with ancient runes for "ay" and "a_e" patterns, wise fox nearby pointing with its tail, magical forest atmosphere with floating lanterns.'
    }
  },
  {
    id: 2,
    word: 'log',
    imageUrl: '🪵✨',
    isSpelling: true,
    correctAnswer: 'log',
    explanation: 'A fallen "log" creates a bridge across the stream - the short o sound in the middle!',
    aiHook: {
      targetWord: 'log',
      intent: 'spelling',
      baseLine: 'Stella discovers a fallen tree trunk that serves as a natural bridge over the magical stream.',
      questionLine: 'Listen and type the short o CVC word for a piece of fallen wood.',
      validationWord: 'log',
      imagePrompt: 'Fallen LOG serving as a bridge over a magical glowing stream in the enchanted forest, with Stella approaching it and mystical light emanating from the water; clearly shows the wooden log bridge.'
    }
  },
  {
    id: 3,
    word: 'fox',
    imageUrl: '🦊✨',
    isSpelling: true,
    correctAnswer: 'fox',
    explanation: 'A wise "fox" appears to guide Stella through the forest - the short o sound in the middle!',
    aiHook: {
      targetWord: 'fox',
      intent: 'spelling',
      baseLine: 'A clever forest fox with glowing amber eyes emerges from behind the magical mushrooms to help Stella.',
      questionLine: 'Listen and type the short o CVC word for the forest animal with a bushy tail.',
      validationWord: 'fox',
      imagePrompt: 'Wise magical FOX with glowing amber eyes emerging from behind glowing mushrooms in the enchanted forest, floating lanterns in background; clearly shows the forest fox as Stella\'s guide.'
    }
  },
];

export const questions: Question[] = [
  {
    id: 1,
    word: 'Ted is my pal',
    imageUrl: '🎵✨',
    isSpacing: true,
    correctAnswer: 'Ted is my pal.',
    explanation: 'Great job! You found the correctly spaced sentence.',
    options: ['Tedismypal.', 'Ted is my pal.'],
    aiHook: {
      targetWord: 'Ted is my pal',
      intent: 'spacing',
      baseLine: 'Listen to this sentence and pick the one with correct spacing between words.',
      questionLine: 'Click on the button to hear the sentence. Then, pick the right spacing.',
      validationWord: 'Ted is my pal.',
      imagePrompt: 'A friendly character named Ted with a warm smile, standing next to a young child in a cheerful, colorful setting that emphasizes friendship and companionship.'
    }
  },
  {
    id: 2,
    word: 'sit',
    imageUrl: '🍄✨',
    isSpelling: true,
    correctAnswer: 'sit',
    explanation: 'Stella can "sit" on the magical mushroom to rest - the short i sound in the middle!',
    aiHook: {
      targetWord: 'sit',
      intent: 'spelling',
      baseLine: 'Stella finds a perfect glowing mushroom to rest upon during her forest adventure.',
      questionLine: 'Listen and type the short i CVC word for resting on something.',
      validationWord: 'sit',
      imagePrompt: 'Stella sitting peacefully on a large glowing mushroom in the enchanted forest, floating lanterns and magical atmosphere around her; clearly shows the action of sitting.'
    }
  },
  {
    id: 3,
    word: 'big',
    imageUrl: '🌳✨',
    isSpelling: true,
    correctAnswer: 'big',
    explanation: 'The ancient tree is very "big" and tall - the short i sound in the middle!',
    aiHook: {
      targetWord: 'big',
      intent: 'spelling',
      baseLine: 'Stella gazes up at the enormous ancient tree that towers above the misty forest.',
      questionLine: 'Listen and type the short i CVC word for something very large.',
      validationWord: 'big',
      imagePrompt: 'Stella looking up at a massive BIG ancient tree in the enchanted forest, emphasizing the enormous size with floating lanterns for scale; clearly shows the gigantic tree.'
    }
  },
  {
    id: 4,
    word: 'run',
    imageUrl: '🏃‍♀️✨',
    isSpelling: true,
    correctAnswer: 'run',
    explanation: 'Stella must "run" quickly through the misty path - the short u sound in the middle!',
    aiHook: {
      targetWord: 'run',
      intent: 'spelling',
      baseLine: 'Stella moves swiftly along the glowing forest path as magical creatures watch from the shadows.',
      questionLine: 'Listen and type the short u CVC word for moving quickly on foot.',
      validationWord: 'run',
      imagePrompt: 'Stella running quickly along a glowing path in the enchanted forest, motion lines showing speed, magical creatures watching from shadows; clearly shows the action of running.'
    }
  },
  {
    id: 5,
    word: 'sun',
    imageUrl: '☀️✨',
    isSpelling: true,
    correctAnswer: 'sun',
    explanation: 'The golden "sun" breaks through the forest canopy - the short u sound in the middle!',
    aiHook: {
      targetWord: 'sun',
      intent: 'spelling',
      baseLine: 'Magical golden sunbeams pierce through the misty forest canopy, illuminating Stella\'s path with warm light.',
      questionLine: 'Listen and type the short u CVC word for the bright light in the sky.',
      validationWord: 'sun',
      imagePrompt: 'Golden SUN rays breaking through the magical forest canopy and illuminating Stella\'s path, warm light filtering through leaves and mist; clearly shows sunbeams in the enchanted forest.'
    }
  },
];

export const options: string[] = ['th', 'ch', 'fr'];


