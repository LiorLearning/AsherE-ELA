import { BlendingQuestion, SpeechQuestion, Question } from './types';

export const blendingQuestions: BlendingQuestion[] = [
  {
    id: 1,
    word: 'Asher',
    imageUrl: '🚀⭐',
    phonemes: ['A', 'sh', 'e', 'r'],
    explanation: "Blend the sounds A-sh-e-r to make 'Asher'!",
  },
];

export const speechQuestions: SpeechQuestion[] = [
  {
    id: 1,
    text:
      "Captain Asher found a big tech gadget in the starship control room. He picked it up and gave it a quick hit to activate it. The gadget made a loud beep that echoed through the futuristic base.",
    imageUrl: '🚀🔧✨',
    expectedWords: ['big', 'hit', 'quick'],
    explanation: 'Great job! You found all the short i CVC words in Captain Asher\'s space adventure.',
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
    explanation: 'Perfect! You sorted the alien data-crystals by their long A patterns - ai and a_e!',
    sortingWords: ['rain', 'cake', 'make', 'train'],
    sortingBins: ['ai', 'a_e'],
    aiHook: {
      targetWord: 'long A patterns',
      intent: 'sorting',
      baseLine: 'Deep in the underground starbase, Captain Asher discovers ancient alien data crystals with glowing symbols that spell different words. Clay explains that to unlock the next portal sequence, he must sort the floating data-crystals by their energy patterns.',
      questionLine: 'Sort the words by their vowel patterns.',
      validationWord: 'vowel patterns',
      imagePrompt: 'Captain Asher in his futuristic space suit standing before a holographic sorting station in the underground starbase, with glowing data-crystals floating around him showing "rain", "cake", "make", "train", two energy sorting chambers labeled with alien symbols for "ai" and "a_e" patterns, Clay the massive brown MudWing dragon nearby with glowing amber eyes, high-tech base with metallic walls and glowing control panels surrounded by jungle vines.'
    }
  },
  {
    id: 2,
    word: 'rain',
    imageUrl: '🌧️✨',
    isFillBlank: true,
    fillBlankPattern: 'r__n',
    correctAnswer: 'rain',
    explanation: 'The alien "rain" falls gently on the starbase dome - the long a sound with ai pattern!',
    aiHook: {
      targetWord: 'rain',
      intent: 'spelling',
      baseLine: 'Captain Asher watches gentle glowing droplets fall from the alien atmosphere above the starbase dome.',
      questionLine: 'Listen and fill in the missing letters for water falling from clouds (long a with ai pattern).',
      validationWord: 'rain',
      imagePrompt: 'Gentle alien RAIN with glowing droplets falling on the futuristic starbase dome with Captain Asher in his space suit watching from inside the underground base, bioluminescent jungle atmosphere; clearly shows rain falling from alien clouds through the dome.'
    }
  },
  {
    id: 3,
    word: 'pain',
    imageUrl: '🤕✨',
    isFillBlank: true,
    fillBlankPattern: 'p__n',
    correctAnswer: 'pain',
    explanation: 'When Captain Asher touches the energy core, he feels "pain" - the long a sound with ai pattern!',
    aiHook: {
      targetWord: 'pain',
      intent: 'spelling',
      baseLine: 'Captain Asher accidentally touches the glowing energy core and learns about being careful in the starbase.',
      questionLine: 'Listen and fill in the missing letters for when something hurts (long a with ai pattern).',
      validationWord: 'pain',
      imagePrompt: 'Captain Asher in his space suit carefully examining a glowing energy core in the underground starbase with a thoughtful expression showing he learned about being careful, bright blue energy emanating from the core; shows the concept of pain as a learning moment.'
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
    explanation: 'The space "train" carries supplies to the starbase - the long a sound with ai pattern!',
    aiHook: {
      targetWord: 'train',
      intent: 'spelling',
      baseLine: 'Captain Asher watches a futuristic supply train arrive at the underground starbase station.',
      questionLine: 'Listen and spell the word for the vehicle that runs on tracks (long a with ai pattern).',
      validationWord: 'train',
      imagePrompt: 'Futuristic space TRAIN arriving at the underground starbase station carrying glowing supply containers, Captain Asher in his space suit watching with interest, high-tech magnetic tracks and energy propulsion; clearly shows the futuristic supply train in the jungle starbase.'
    }
  },
  {
    id: 2,
    word: 'tail',
    imageUrl: '🐉✨',
    isSpelling: true,
    correctAnswer: 'tail',
    explanation: 'Clay the dragon swishes his massive "tail" - the long a sound with ai pattern!',
    aiHook: {
      targetWord: 'tail',
      intent: 'spelling',
      baseLine: 'Captain Asher watches Clay the massive brown MudWing dragon swish his powerful tail as he helps explore the jungle.',
      questionLine: 'Listen and spell the word for the long part at the back of an animal (long a with ai pattern).',
      validationWord: 'tail',
      imagePrompt: 'Clay the massive brown MudWing dragon with strong limbs and wide wings, swishing his powerful TAIL gracefully in the futuristic jungle on Ragonia 7\'s moon, Captain Asher in his space suit watching with amazement, glowing alien plants around; clearly shows the dragon\'s tail.'
    }
  },
  {
    id: 3,
    word: 'mail',
    imageUrl: '📡✨',
    isSpelling: true,
    correctAnswer: 'mail',
    explanation: 'Captain Asher receives cosmic "mail" with mission data - the long a sound with ai pattern!',
    aiHook: {
      targetWord: 'mail',
      intent: 'spelling',
      baseLine: 'Captain Asher finds holographic messages with secret mission data delivered to the underground starbase.',
      questionLine: 'Listen and spell the word for letters delivered to your house (long a with ai pattern).',
      validationWord: 'mail',
      imagePrompt: 'Captain Asher in his space suit receiving cosmic MAIL with glowing holographic data packets at the futuristic starbase communication station, floating digital envelopes around; clearly shows space mail delivery in the underground base.'
    }
  },
  {
    id: 4,
    word: 'nail',
    imageUrl: '🔧✨',
    isSpelling: true,
    correctAnswer: 'nail',
    explanation: 'Captain Asher uses a tech "nail" to secure equipment - the long a sound with ai pattern!',
    aiHook: {
      targetWord: 'nail',
      intent: 'spelling',
      baseLine: 'Captain Asher carefully uses a glowing tech nail to secure important equipment around the underground starbase.',
      questionLine: 'Listen and spell the word for the sharp thing you hammer into wood (long a with ai pattern).',
      validationWord: 'nail',
      imagePrompt: 'Captain Asher in his space suit using a glowing tech NAIL to secure holographic equipment panels in the underground starbase, advanced energy tools with bright lights around; clearly shows the futuristic nail and equipment mounting in the high-tech base.'
    }
  },
];

export const options: string[] = ['th', 'ch', 'fr'];


