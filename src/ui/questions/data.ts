import { BlendingQuestion, SpeechQuestion, Question } from './types';

export const blendingQuestions: BlendingQuestion[] = [
  {
    id: 1,
    word: 'London',
    imageUrl: '✨💖',
    phonemes: ['L', 'o', 'n', 'd', 'o', 'n'],
    explanation: "Blend the sounds L-o-n-d-o-n to make 'London'!",
  },
];

export const speechQuestions: SpeechQuestion[] = [];

export const longAQuestions: Question[] = [
  // Step 2 changed from sorting to fill-in-the-blank per FLOSS rule
  {
    id: 1,
    word: 'fluff',
    imageUrl: '🧁✨',
    isFillBlank: true,
    fillBlankPattern: 'fl__f',
    correctAnswer: 'fluff',
    explanation: 'Sprinkle Beast\'s whipped cream hair is so soft and fluffy—finish the word!',
    aiHook: {
      targetWord: 'fluff',
      intent: 'spelling',
      baseLine: 'London watches Sprinkle Beast the giant cupcake monster fluff up his whipped cream hair as magical sparkles swirl around the enchanted bakery.',
      questionLine: 'Listen and fill in the missing letters for something soft and puffy (FLOSS rule with double f).',
      validationWord: 'fluff',
      imagePrompt: 'London in her sparkly star dress watching Sprinkle Beast the giant cupcake monster with incredibly FLUFFY whipped cream hair in the enchanted bakery, magical sparkles floating around, soft puffy clouds of whipped cream, rainbow frosting shelves; clearly shows the concept of fluff and softness.'
    }
  },
  // Step 3 fill-in-the-blank
  {
    id: 2,
    word: 'jazz',
    imageUrl: '🎶✨',
    isFillBlank: true,
    fillBlankPattern: 'ja__',
    correctAnswer: 'jazz',
    explanation: 'The mixer hums a jazzy beat—complete the word you hear!',
    aiHook: {
      targetWord: 'jazz',
      intent: 'spelling',
      baseLine: 'London listens as the magical mixer creates a rhythmic jazzy beat that echoes through the enchanted bakery, making all the ingredients dance.',
      questionLine: 'Listen and fill in the missing letters for a musical style with rhythm (FLOSS rule with double z).',
      validationWord: 'jazz',
      imagePrompt: 'London in her sparkly star dress listening to a magical mixer creating JAZZ music with musical notes floating around the enchanted bakery, ingredients dancing to the beat, rhythmic sparkles; clearly shows jazz music and rhythm.'
    }
  },
  // Step 4 fill-in-the-blank
  {
    id: 3,
    word: 'shell',
    imageUrl: '🥚✨',
    isFillBlank: true,
    fillBlankPattern: 'she__',
    correctAnswer: 'shell',
    explanation: 'London cracks an eggshell over the glowing bowl—fill in the missing letters!',
    aiHook: {
      targetWord: 'shell',
      intent: 'spelling',
      baseLine: 'London carefully cracks a magical golden eggshell over the glowing mixing bowl, watching the sparkly contents pour into her special recipe.',
      questionLine: 'Listen and fill in the missing letters for the hard outer covering of an egg (FLOSS rule with double l).',
      validationWord: 'shell',
      imagePrompt: 'London in her sparkly star dress cracking a magical golden EGGSHELL over a glowing mixing bowl in the enchanted bakery, sparkly egg contents flowing out, magical golden light; clearly shows the eggshell being cracked.'
    }
  },
];

export const questions: Question[] = [
  // Steps 7–10 updated to FLOSS-rule spelling words
  {
    id: 1,
    word: 'buzz',
    imageUrl: '🔔✨',
    isSpelling: true,
    correctAnswer: 'buzz',
    explanation: 'The magical ovens buzz when a recipe is ready. Spell the word.',
    aiHook: {
      targetWord: 'buzz',
      intent: 'spelling',
      baseLine: 'London hears the magical ovens buzz with excitement as her recipe reaches the perfect temperature, filling the enchanted bakery with melodic humming.',
      questionLine: 'Listen and spell the word for the sound a bee makes or when something vibrates (FLOSS rule with double z).',
      validationWord: 'buzz',
      imagePrompt: 'London in her sparkly star dress standing near magical ovens that are BUZZING with golden energy in the enchanted bakery, sound waves and sparkles emanating from the ovens, her blonde sidekick nearby; clearly shows the buzzing ovens.'
    }
  },
  {
    id: 2,
    word: 'fizz',
    imageUrl: '🧪✨',
    isSpelling: true,
    correctAnswer: 'fizz',
    explanation: 'A sparkly potion fizzes in the mixing jar. Spell the word.',
    aiHook: {
      targetWord: 'fizz',
      intent: 'spelling',
      baseLine: 'London watches a sparkly magical potion fizz and bubble in her crystal mixing jar, creating rainbow bubbles that float around the enchanted bakery.',
      questionLine: 'Listen and spell the word for when bubbles form and pop in a drink (FLOSS rule with double z).',
      validationWord: 'fizz',
      imagePrompt: 'London in her sparkly star dress watching a magical potion FIZZING with colorful bubbles in a crystal jar in the enchanted bakery, rainbow bubbles floating around, sparkling liquid; clearly shows the fizzing potion.'
    }
  },
  {
    id: 3,
    word: 'spill',
    imageUrl: '🍬✨',
    isSpelling: true,
    correctAnswer: 'spill',
    explanation: 'Uh-oh! A sprinkle spill slides across the counter. Spell the word.',
    aiHook: {
      targetWord: 'spill',
      intent: 'spelling',
      baseLine: 'London gasps as colorful sprinkles spill across the magical counter, creating a rainbow cascade that sparkles as it slides toward the edge.',
      questionLine: 'Listen and spell the word for when liquid or small things fall and spread out (FLOSS rule with double l).',
      validationWord: 'spill',
      imagePrompt: 'London in her sparkly star dress looking at colorful sprinkles SPILLING across a magical counter in the enchanted bakery, rainbow cascade of sprinkles flowing, surprised expression; clearly shows the spilling sprinkles.'
    }
  },
  {
    id: 4,
    word: 'staff',
    imageUrl: '🔮✨',
    isSpelling: true,
    correctAnswer: 'staff',
    explanation: 'London lifts a glowing baking staff to calm the frosting storm. Spell the word.',
    aiHook: {
      targetWord: 'staff',
      intent: 'spelling',
      baseLine: 'London lifts her magical glowing baking staff high above her head, sending calming sparkles into the wild frosting storm that swirls around the enchanted bakery.',
      questionLine: 'Listen and spell the word for a long stick used by wizards or bakers (FLOSS rule with double f).',
      validationWord: 'staff',
      imagePrompt: 'London in her sparkly star dress holding a magical glowing baking STAFF above her head in the enchanted bakery, calming a frosting storm with sparkles emanating from the staff, dramatic magical scene; clearly shows the magical staff.'
    }
  },
];

export const options: string[] = ['th', 'ch', 'fr'];


