import { BlendingQuestion, SpeechQuestion, Question } from './types';

export const blendingQuestions: BlendingQuestion[] = [
  {
    id: 1,
    word: 'Ally',
    imageUrl: '✨👩‍🚀',
    phonemes: ['A', 'l', 'ly'],
    explanation: "Blend the sounds A-l-ly to make 'Ally'!",
  },
];

export const speechQuestions: SpeechQuestion[] = [
  {
    id: 1,
    text:
      "Amazing! Ally just discovered the magical Candy Rocket Shop in the floating jellyfish jungle! The glowing box jellyfish threw a huge celebration with sparkles everywhere. Now it's time to explore their enchanted treehouse. Ally and Princess Piggy ride on the back of a gentle space whale through purple clouds. Below them, they see a massive crystal cave filled with glowing treasure. 'Let's make this place our new home base!' says Ally excitedly. But suddenly, they notice strange smoke rising from a distant mountain...",
    imageUrl: '✨🌙👽💎🌍',
    expectedWords: ['red', 'net', 'get'],
    explanation: 'Fantastic reading! You captured all the exciting silent e words in the celebration adventure.',
  },
];

export const longAQuestions: Question[] = [
  {
    id: 1,
    word: 'jet',
    imageUrl: '🚀✨',
    isSpelling: true,
    correctAnswer: 'jet',
    explanation: 'Ally\'s rocket "jet" zooms through the clouds - the short e sound in the middle!',
    aiHook: {
      targetWord: 'jet',
      intent: 'spelling',
      baseLine: 'Ally\'s speedy rocket ship zooms through the purple clouds toward the jellyfish jungle.',
      questionLine: 'Listen and type the short e word for the fast flying machine.',
      validationWord: 'jet',
      imagePrompt: 'Ally\'s sleek rocket JET flying through purple clouds with sparkles trailing behind, jellyfish jungle visible below; clearly shows a rocket ship in flight.'
    }
  },
  {
    id: 2,
    word: 'hen',
    imageUrl: '🐔✨',
    isSpelling: true,
    correctAnswer: 'hen',
    explanation: 'A friendly space "hen" lays glowing eggs - the short e sound in the middle!',
    aiHook: {
      targetWord: 'hen',
      intent: 'spelling',
      baseLine: 'A magical feathered friend in the treehouse lays sparkly eggs for their adventure snacks.',
      questionLine: 'Listen and type the short e word for the egg-laying bird.',
      validationWord: 'hen',
      imagePrompt: 'Friendly space HEN with glowing feathers sitting in a nest in the jungle treehouse, sparkly eggs visible, magical atmosphere; composition highlights the hen clearly.'
    }
  },
];

export const questions: Question[] = [
  {
    id: 1,
    word: 'map',
    imageUrl: '🗺️✨',
    isSpelling: true,
    correctAnswer: 'map',
    explanation: 'Ally uses a treasure "map" - the short a sound in the middle!',
    aiHook: {
      targetWord: 'map',
      intent: 'spelling',
      baseLine: 'Ally unfolds an ancient treasure guide to find the crystal cave hidden in the jungle.',
      questionLine: 'Listen and type the short a word for what shows the way.',
      validationWord: 'map',
      imagePrompt: 'Close-up of Ally holding an ancient glowing treasure MAP with jungle paths and crystal cave marked, magical sparkles around the edges; clearly shows a folded map with adventure markings.'
    }
  },
  {
    id: 2,
    word: 'jam',
    imageUrl: '🍓✨',
    isSpelling: true,
    correctAnswer: 'jam',
    explanation: 'Princess Piggy loves strawberry "jam" - the short a sound in the middle!',
    aiHook: {
      targetWord: 'jam',
      intent: 'spelling',
      baseLine: 'Princess Piggy spreads the sweet strawberry treat on her space crackers during snack time.',
      questionLine: 'Listen and type the short a word for the sweet spread.',
      validationWord: 'jam',
      imagePrompt: 'Princess Piggy in elegant pink dress with tiara spreading strawberry JAM on crackers in the jungle treehouse, jar of jam clearly visible with sparkly label; focus on the jam jar.'
    }
  },
  {
    id: 3,
    word: 'cat',
    imageUrl: '🐱👑',
    isSpelling: true,
    correctAnswer: 'cat',
    explanation: 'The royal "cat" guides them through the jungle - the short a sound in the middle!',
    aiHook: {
      targetWord: 'cat',
      intent: 'spelling',
      baseLine: 'One of the 17 white feline friends with a pink bow leads Ally toward the magical treehouse.',
      questionLine: 'Listen and type the short a word for the furry guide.',
      validationWord: 'cat',
      imagePrompt: 'Elegant white CAT with pink bow and royal collar leading Ally through the floating jellyfish jungle, treehouse visible in background; composition highlights the cat as the guide.'
    }
  },
  {
    id: 4,
    word: 'hat',
    imageUrl: '👩‍🚀✨',
    isSpelling: true,
    correctAnswer: 'hat',
    explanation: 'Ally puts on her space "hat" - the short a sound in the middle!',
    aiHook: {
      targetWord: 'hat',
      intent: 'spelling',
      baseLine: 'Ally adjusts the protective headgear before exploring the mysterious alien planet.',
      questionLine: 'Listen and type the short a word for what protects her head.',
      validationWord: 'hat',
      imagePrompt: 'Close-up of Ally putting on her space helmet HAT with jungle gear, glowing visor reflecting the jellyfish jungle; clearly shows the helmet as headwear.'
    }
  },
];

export const options: string[] = ['th', 'ch', 'fr'];


