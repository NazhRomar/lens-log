// Guide content. Each topic has an id (used in the URL), a section, and steps.
// A step may name an `art` key from ./illustrations. Topics with no steps yet
// show a "being written" note.

export const DISCLAIMER = "General guidance only. Always follow your eye care professional's instructions.";

export const SECTIONS = [
  { id: 'routine', title: 'Daily routine' },
  { id: 'safety', title: 'Safety' },
];

export const TOPICS = [
  {
    id: 'red-flags',
    section: null, // shown as its own card at the top
    title: 'Red flags',
    summary: 'Pain, redness, blur, light sensitivity',
    steps: [
      {
        title: 'Take your lenses out',
        body: 'If you have eye pain, redness that does not go away, blurry vision, sensitivity to light, unusual discharge or watering, or a feeling that something is stuck, remove your lenses right away.',
      },
      {
        title: 'Do not put them back in',
        body: 'Leave the lenses out, even if your eye starts to feel better. Keep the lenses and case: your eye doctor may want to see them.',
      },
      {
        title: 'Contact an eye doctor promptly',
        body: 'Call your eye doctor or optometrist the same day. Eye infections linked to contact lenses can get worse quickly.',
        tip: 'If you have severe pain or a sudden loss of vision, seek urgent care.',
      },
    ],
  },
  {
    id: 'before-you-start',
    section: 'routine',
    title: 'Before you start',
    summary: 'Wash and dry your hands',
    steps: [
      {
        title: 'Wash your hands',
        body: 'Use soap and water and wash for at least 20 seconds. Pick a mild soap without moisturizers or perfume, which can leave a film on the lens.',
      },
      {
        title: 'Dry them completely',
        body: 'Dry your hands with a clean, lint-free towel. Wet hands can transfer water to the lens, and lint sticks to it.',
        tip: 'Never let tap water touch your lenses or case. It can carry germs that cause serious eye infections.',
      },
      {
        title: 'Set up a clean space',
        body: 'Work over a clean, flat surface, with a mirror, your case and fresh solution within reach. If you are at a sink, close the drain first so a dropped lens is not lost.',
      },
      {
        title: 'Do things in the right order',
        body: 'Put your lenses in before makeup and hand cream. Take them out before you remove makeup.',
      },
    ],
  },
  {
    id: 'opening-pack',
    section: 'routine',
    title: 'Opening a blister pack',
    summary: 'Peel, check, never use a torn lens',
    steps: [
      {
        title: 'Check the label',
        body: 'Make sure the power on the pack matches the eye you are about to do, and that the pack is not past its expiry date.',
        tip: 'Your left and right prescriptions are different. Check the label every time so the lenses never get swapped.',
      },
      {
        title: 'Check the seal',
        body: 'Do not use a lens if the foil is torn or the pack has leaked or dried out. Open a new one instead.',
      },
      {
        title: 'Shake and peel',
        body: 'Shake the pack gently so the lens floats free, then hold it flat and slowly peel back the foil.',
      },
      {
        title: 'Take the lens out',
        body: 'Slide the lens up the side of the blister with a clean fingertip. Do not use your nails or tweezers.',
      },
      {
        title: 'Inspect the lens',
        body: 'Look at it on your fingertip. If it is torn, chipped or dirty, throw it away and open a new one.',
        tip: 'On the Home screen, tap "Replace lenses" when you open a new pair so the countdown starts again.',
      },
    ],
  },
  {
    id: 'putting-in',
    section: 'routine',
    title: 'Putting lenses in',
    summary: '7 steps, same eye first every time',
    steps: [
      {
        title: 'Wash and dry your hands',
        body: 'Use soap and water, rinse well, and dry with a lint-free towel. Any lotion or oil on your fingers ends up on the lens.',
        tip: 'Keep nails short and smooth so they cannot scratch the lens or your eye.',
      },
      {
        title: 'Check the lens',
        body: 'Rinse the lens with fresh solution and look at it on your fingertip. It should be clean, round and undamaged.',
        tip: 'Never wear a torn or chipped lens. Open a new one instead.',
      },
      {
        title: 'Make sure it is not inside out',
        body: 'Look at the lens from the side. A correct lens is a smooth bowl with edges pointing up. If the edges flare outward like a lip, flip it.',
        tip: 'Taco test: gently pinch the lens. If the edges curl inward, it is the right way round.',
        art: 'insideOut',
      },
      {
        title: 'Hold your eye open',
        body: 'Use the middle finger of the same hand to pull down your lower lid. Use the other hand to hold your upper lid against the brow bone.',
      },
      {
        title: 'Place the lens',
        body: 'Look straight ahead or slightly up and gently place the lens on your eye. It does not need to be pressed.',
        tip: 'If it feels sharp or scratchy, take it out, rinse it with solution and try again.',
      },
      {
        title: 'Release and blink',
        body: 'Slowly let go of your lids, look down, then blink a few times. The lens will center itself.',
      },
      {
        title: 'Repeat with the other eye',
        body: 'Do the second eye the same way. Always start with the same eye so the left and right lenses never get mixed up.',
        tip: 'Your left and right prescriptions are different. Lens Log keeps them separate for you.',
      },
    ],
  },
  {
    id: 'taking-out',
    section: 'routine',
    title: 'Taking lenses out',
    summary: 'Pinch method and stuck lenses',
    steps: [
      {
        title: 'Wash and dry your hands',
        body: 'Same as putting them in: soap, water, and a lint-free towel.',
      },
      {
        title: 'Look up and hold your lid',
        body: 'Look up and use the middle finger of one hand to pull your lower lid down.',
      },
      {
        title: 'Slide the lens down',
        body: 'With the tip of your index finger, gently slide the lens down onto the white part of your eye.',
        art: 'removePinch',
      },
      {
        title: 'Pinch it off',
        body: 'Gently pinch the lens between your thumb and index finger and lift it off. Use the pads of your fingers, not your nails.',
      },
      {
        title: 'Store it or throw it away',
        body: 'Daily lenses go in the bin. Other lenses go straight into a clean case with fresh solution, unless they have reached their replacement date.',
        tip: 'On the Home screen, tap "Take lenses out" so your wear time is logged.',
      },
      {
        title: 'If a lens feels stuck',
        body: 'It is usually just dry. Blink a few times or use rewetting drops made for contact lenses, wait a few minutes, then try again.',
        tip: 'If you cannot find the lens or your eye hurts, see the Red flags guide and contact your eye doctor.',
      },
    ],
  },
  {
    id: 'cleaning',
    section: 'routine',
    title: 'Cleaning and storage',
    summary: 'Rub, rinse, fresh solution, air-dry',
    steps: [
      {
        title: 'Rub and rinse',
        body: 'Put the lens in your palm, add a few drops of solution and rub it gently with a fingertip on both sides. Then rinse it with more solution.',
        tip: 'Follow the instructions on your solution bottle: some tell you exactly how long to rub and soak.',
      },
      {
        title: 'Fresh solution every time',
        body: 'Empty the case and fill it with new solution each time you store your lenses. Never top up old solution.',
      },
      {
        title: 'Only use contact lens solution',
        body: 'Never rinse or store lenses in tap water, bottled water, saline you made yourself, or saliva. These can cause serious eye infections.',
      },
      {
        title: 'Clean the case',
        body: 'After putting your lenses in, empty the case, rinse it with solution (not water), wipe it with a clean tissue, and leave it upside down with the caps off to air-dry.',
        art: 'caseDry',
      },
      {
        title: 'Replace the case',
        body: 'Get a new case at least every 3 months, or sooner if it is cracked or dirty. Track it under Supplies and Lens Log will remind you.',
      },
      {
        title: 'Look after the bottle',
        body: 'Keep the tip from touching anything, close it after use, and throw it away once it has been open longer than the label says.',
        tip: 'Using a hydrogen peroxide system? Only use the case it came with, and never put the solution in your eye before it has finished neutralizing.',
      },
    ],
  },
  {
    id: 'never',
    section: 'safety',
    title: 'Never do this',
    summary: 'Sleeping, napping, tap water, sharing',
    steps: [
      {
        title: 'Never sleep or nap in your lenses',
        body: 'Sleeping in lenses greatly raises the risk of eye infection, even for a short nap. Take them out first, unless your eye doctor has prescribed lenses for overnight wear.',
      },
      {
        title: 'Keep lenses away from water',
        body: 'Take them out before showering, swimming or using a hot tub. If water does get in, throw daily lenses away and disinfect other lenses before wearing them again.',
      },
      {
        title: 'Do not stretch your lenses',
        body: 'Replace them on schedule and stay within your daily wear limit. Lenses worn too long let less oxygen reach your eye.',
      },
      {
        title: 'Never share lenses',
        body: 'Not even decorative ones. Lenses are fitted to your eyes, and sharing spreads infections.',
      },
      {
        title: 'Do not wear lenses on a sore eye',
        body: 'If your eye is red, painful or your vision is blurry, take the lenses out and check the Red flags guide.',
      },
    ],
  },
  {
    id: 'inside-out',
    section: 'safety',
    title: 'Inside-out check',
    summary: 'The taco test and edge shape',
    steps: [
      {
        title: 'Look at the edge',
        body: 'Balance the lens on your fingertip and look at it from the side. A correct lens is a smooth bowl with the edges pointing up. If the edges flare outward like a lip, it is inside out.',
        art: 'insideOut',
      },
      {
        title: 'Try the taco test',
        body: 'Gently pinch the lens between your thumb and finger. If the edges curl inward like a taco, it is the right way round. If they flop outward, flip it.',
      },
      {
        title: 'Look for markings',
        body: 'Some lenses have tiny numbers or letters printed near the edge. If they read correctly when you look from outside the lens, it is the right way round.',
      },
      {
        title: 'If it feels wrong in your eye',
        body: 'An inside-out lens usually feels uncomfortable or moves around. Take it out, rinse it with solution, flip it and try again.',
      },
    ],
  },
  {
    id: 'makeup',
    section: 'safety',
    title: 'Makeup and lenses',
    summary: 'Lenses in first, out first',
    steps: [
      {
        title: 'Lenses in first',
        body: 'Put your lenses in before applying makeup, so nothing from your fingers ends up on the lens.',
      },
      {
        title: 'Choose eye-friendly products',
        body: 'Avoid glitter and loose powder near your eyes, and keep eyeliner off the inner rim of your eyelids.',
      },
      {
        title: 'Sprays with eyes closed',
        body: 'Close your eyes when using hairspray, setting spray or perfume, or put your lenses in afterwards.',
      },
      {
        title: 'Lenses out first',
        body: 'Take your lenses out before removing makeup, so remover does not get on them.',
      },
      {
        title: 'Keep eye makeup fresh',
        body: 'Replace mascara and liquid liner about every 3 months, and never share eye makeup.',
      },
    ],
  },
];

export function getTopic(id) {
  return TOPICS.find((t) => t.id === id);
}
