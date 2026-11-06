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
  { id: 'before-you-start', section: 'routine', title: 'Before you start', summary: 'Wash and dry your hands', steps: [] },
  { id: 'opening-pack', section: 'routine', title: 'Opening a blister pack', summary: 'Peel, check, never use a torn lens', steps: [] },
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
  { id: 'taking-out', section: 'routine', title: 'Taking lenses out', summary: 'Pinch method and stuck lenses', steps: [] },
  { id: 'cleaning', section: 'routine', title: 'Cleaning and storage', summary: 'Rub, rinse, fresh solution, air-dry', steps: [] },
  { id: 'never', section: 'safety', title: 'Never do this', summary: 'Sleeping, napping, tap water, sharing', steps: [] },
  { id: 'inside-out', section: 'safety', title: 'Inside-out check', summary: 'The taco test and edge shape', steps: [] },
  { id: 'makeup', section: 'safety', title: 'Makeup and lenses', summary: 'Lenses in first, out first', steps: [] },
];

export function getTopic(id) {
  return TOPICS.find((t) => t.id === id);
}
