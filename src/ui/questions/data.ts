import { BlendingQuestion, SpeechQuestion, Question } from './types';

export const blendingQuestions: BlendingQuestion[] = [
  {
    id: 1,
    word: 'London',
    imageUrl: '🧁⭐',
    phonemes: ['L', 'o', 'n', 'd', 'o', 'n'],
    explanation: "Blend the sounds L-o-n-d-o-n to make 'London'!",
  },
];

export const speechQuestions: SpeechQuestion[] = [
  {
    id: 1,
    text:
      "London found a big whisk in the bakery kitchen. She picked it up and gave it a quick hit against a mixing bowl. The whisk made a loud sound that echoed through the magical bakery.",
    imageUrl: '🧁🥄✨',
    expectedWords: ['big', 'whisk', 'hit'],
    explanation: 'Great job! You found all the short i CVC words in London\'s bakery adventure.',
  },
];

export const longAQuestions: Question[] = [
  {
    id: 1,
    word: 'Sort the words by their vowel patterns',
    imageUrl: '🔤✨',
    isSorting: true,
    correctAnswer: {
      'ai': ['rain', 'train'],
      'a_e': ['cake', 'make']
    },
    explanation: 'Perfect! You sorted the magical word-stones by their long A patterns - ai and a_e!',
    sortingWords: ['rain', 'cake', 'make', 'train'],
    sortingBins: ['ai', 'a_e'],
    aiHook: {
      targetWord: 'long A patterns',
      intent: 'sorting',
      baseLine: 'Deep in the magical bakery, London discovers an ancient recipe book with magical runes that spell different words. The wise Sparkle explains that to unlock the next baking spell, she must sort the glowing ingredient-stones by their hidden patterns.',
      questionLine: 'Sort the words by their vowel patterns.',
      validationWord: 'vowel patterns',
      imagePrompt: 'London standing before a mystical ingredient sorting counter in the enchanted bakery, with glowing word-stones floating around her showing "rain", "cake", "make", "train", two magical sorting bins labeled with ancient runes for "ai" and "a_e" patterns, wise Sparkle nearby pointing, magical bakery atmosphere with glowing ovens and sparkling decorations.'
    }
  },
  {
    id: 2,
    word: 'rain',
    imageUrl: '🌧️✨',
    isFillBlank: true,
    fillBlankPattern: 'r__n',
    correctAnswer: 'rain',
    explanation: 'The magical "rain" falls gently on the bakery windows - the long a sound with ai pattern!',
    aiHook: {
      targetWord: 'rain',
      intent: 'spelling',
      baseLine: 'London watches gentle magical droplets fall from the enchanted clouds above the bakery.',
      questionLine: 'Listen and fill in the missing letters for water falling from clouds (long a with ai pattern).',
      validationWord: 'rain',
      imagePrompt: 'Gentle magical RAIN falling on the enchanted bakery windows with London watching from inside, sparkling droplets and mystical atmosphere; clearly shows rain falling from enchanted clouds.'
    }
  },
  {
    id: 3,
    word: 'pain',
    imageUrl: '🤕✨',
    isFillBlank: true,
    fillBlankPattern: 'p__n',
    correctAnswer: 'pain',
    explanation: 'When London touches the hot oven, she feels "pain" - the long a sound with ai pattern!',
    aiHook: {
      targetWord: 'pain',
      intent: 'spelling',
      baseLine: 'London accidentally touches the magical oven and learns about being careful in the bakery.',
      questionLine: 'Listen and fill in the missing letters for when something hurts (long a with ai pattern).',
      validationWord: 'pain',
      imagePrompt: 'London carefully touching a magical oven in the enchanted bakery with a gentle expression showing she learned about being careful, warm glowing light from the oven; shows the concept of pain as a learning moment.'
    }
  },
];

export const questions: Question[] = [
  {
    id: 1,
    word: 'train',
    imageUrl: '🚂✨',
    isSpelling: true,
    correctAnswer: 'train',
    explanation: 'The magical "train" carries ingredients to the bakery - the long a sound with ai pattern!',
    aiHook: {
      targetWord: 'train',
      intent: 'spelling',
      baseLine: 'London watches a magical ingredient train arrive at the enchanted bakery station.',
      questionLine: 'Listen and spell the word for the vehicle that runs on tracks (long a with ai pattern).',
      validationWord: 'train',
      imagePrompt: 'Magical TRAIN arriving at the enchanted bakery station carrying glowing ingredients, London watching with wonder, sparkling tracks and mystical steam; clearly shows the magical ingredient train.'
    }
  },
  {
    id: 2,
    word: 'tail',
    imageUrl: '🦊✨',
    isSpelling: true,
    correctAnswer: 'tail',
    explanation: 'The bakery fox swishes its fluffy "tail" - the long a sound with ai pattern!',
    aiHook: {
      targetWord: 'tail',
      intent: 'spelling',
      baseLine: 'London watches the magical bakery fox swish its beautiful fluffy tail as it helps her.',
      questionLine: 'Listen and spell the word for the long part at the back of an animal (long a with ai pattern).',
      validationWord: 'tail',
      imagePrompt: 'Magical bakery fox with a beautiful fluffy TAIL swishing gracefully in the enchanted bakery, London watching with delight, sparkling fairy lights around; clearly shows the fox\'s tail.'
    }
  },
  {
    id: 3,
    word: 'mail',
    imageUrl: '📮✨',
    isSpelling: true,
    correctAnswer: 'mail',
    explanation: 'London receives magical "mail" with recipes - the long a sound with ai pattern!',
    aiHook: {
      targetWord: 'mail',
      intent: 'spelling',
      baseLine: 'London finds magical letters with secret baking recipes delivered to the enchanted bakery.',
      questionLine: 'Listen and spell the word for letters delivered to your house (long a with ai pattern).',
      validationWord: 'mail',
      imagePrompt: 'London receiving magical MAIL with glowing recipe letters at the enchanted bakery mailbox, sparkling envelopes floating around; clearly shows magical mail delivery.'
    }
  },
  {
    id: 4,
    word: 'nail',
    imageUrl: '🔨✨',
    isSpelling: true,
    correctAnswer: 'nail',
    explanation: 'London uses a magical "nail" to hang decorations - the long a sound with ai pattern!',
    aiHook: {
      targetWord: 'nail',
      intent: 'spelling',
      baseLine: 'London carefully uses a sparkling nail to hang beautiful decorations around the enchanted bakery.',
      questionLine: 'Listen and spell the word for the sharp thing you hammer into wood (long a with ai pattern).',
      validationWord: 'nail',
      imagePrompt: 'London using a magical sparkling NAIL to hang glowing decorations in the enchanted bakery, gentle hammer work with fairy lights around; clearly shows the nail and decoration hanging.'
    }
  },
];

export const options: string[] = ['th', 'ch', 'fr'];


