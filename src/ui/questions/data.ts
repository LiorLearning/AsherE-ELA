import { BlendingQuestion, SpeechQuestion, Question } from './types';

export const blendingQuestions: BlendingQuestion[] = [
  {
    id: 1,
    word: 'Asher',
    imageUrl: '🧑‍🚀',
    phonemes: ['a', 'sh', 'er'],
    explanation: "Blend the sounds a-sh-er to make 'Asher'!",
  },
];

export const speechQuestions: SpeechQuestion[] = [
  {
    id: 1,
    text:
      "Map, please! Captain Asher and Clay were in the moon jungle. Shracker zipped overhead. The boss ran at Asher. Asher slid aside—WHOOSH! The boss fell into a spinning hole. A bright gate glowed. ‘Map, please,’ said Asher. The gate gave him a map.",
    imageUrl: '🗺️🚪✨🌙🌴',
    expectedWords: ['map', 'gate'],
    explanation: 'Great reading! You said the important words from the story.',
  },
];

export const questions: Question[] = [
  {
    id: 1,
    word: 'ship',
    imageUrl: '🚀',
    correctAnswer: 2,
    explanation: 'Captain Asher flies his amazing space "ship" - it starts with "sh"!',
    aiHook: {
      targetWord: 'ship',
      intent: 'sound',
      baseLine: 'Across the water, something big glides toward Captain Asher.',
      questionLine: 'What sound does it start with?',
      validationWord: 'ship'
    }
  },
  {
    id: 2,
    word: 'chop',
    imageUrl: '🪓',
    isSpelling: true,
    correctAnswer: 'chop',
    explanation: 'Clay uses his laser axe to "chop" jungle vines!',
    aiHook: {
      targetWord: 'chop',
      intent: 'spelling',
      baseLine: 'From the vines, you hear a steady cutting sound ahead.',
      questionLine: 'What is that word?',
      validationWord: 'chop'
    }
  },
  {
    id: 5,
    word: 'clay',
    imageUrl: '🐉',
    isSpelling: true,
    correctAnswer: 'clay',
    explanation: "Type the sidekick's name: Clay!",
    aiHook: {
      targetWord: 'clay',
      intent: 'spelling',
      baseLine: 'Clay lands beside Asher in the moon jungle.',
      questionLine: 'What is that word?',
      validationWord: 'clay'
    }
  },
  {
    id: 6,
    word: 'shracker',
    imageUrl: '🤖🐦',
    isSpelling: true,
    correctAnswer: 'shracker',
    explanation: "Type the robo-bird's name: Shracker!",
    aiHook: {
      targetWord: 'shracker',
      intent: 'spelling',
      baseLine: 'Suddenly, a metallic bird with glowing eyes circles overhead.',
      questionLine: 'What is that word?',
      validationWord: 'shracker'
    }
  },
];

export const options: string[] = ['th', 'ch', 'sh'];


