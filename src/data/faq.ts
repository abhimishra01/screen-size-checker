// FAQ shown on the home page and in the FAQPage JSON-LD. Plain text answers only.
export const faq = [
  {
    q: 'What size is my screen?',
    a: 'Press Measure with a card, hold any bank card flat on the screen, and drag the outline until it matches the card. The checker then shows the diagonal in inches and cm, plus the width, height and pixel density. The match takes about 20 seconds and is saved in your browser.',
  },
  {
    q: 'Can a website detect my screen size in inches?',
    a: 'No. A browser tells a page how many pixels the screen has and the pixel ratio, but not how big a pixel is. Sites that print inches right away guess from the resolution or from a list of devices, and two sites can give two different answers for the same screen. A card of known size gives the page the missing number.',
  },
  {
    q: 'How do I measure my screen size by hand?',
    a: 'Use a tape measure from one corner of the visible picture to the opposite corner. Do not include the frame (bezel) around the screen. The result in inches is the screen size. For width and height, measure the visible area across and up.',
  },
  {
    q: 'Why does my 15.6 inch laptop measure 15.5 inches?',
    a: 'Makers round the size, and some screens have rounded corners that the sold size still counts. A card match by eye can also be off by a fraction of a millimeter. A gap of 0.1 to 0.2 inches is normal. The checker also shows the closest common size.',
  },
  {
    q: 'Is screen size the same as screen resolution?',
    a: 'No. Screen size is the physical diagonal, in inches or cm. Resolution is the number of pixels, for example 1920 x 1080. Two screens of the same size can have different resolutions. Pixel density (PPI) links the two: pixels along the diagonal divided by the diagonal in inches.',
  },
  {
    q: 'Which card can I use?',
    a: "Any card in the standard ID-1 size: a credit card, debit card, driver's license, library card, gift card or hotel key card. They are all 85.6 by 53.98 mm. Business cards are a different size, so do not use one.",
  },
  {
    q: 'Does it work on a phone or tablet?',
    a: 'Yes. On a narrow screen the outline stands on its short side, so the card fits. Keep the page at 100 percent zoom while you match the card. If you pinch to zoom, the outline is no longer true size and the checker warns you.',
  },
  {
    q: 'Do you save or send my measurements?',
    a: 'Nothing is sent. The card match is saved only in this browser, one record per screen. The online ruler on this site reads the same record, so you match the card once for both tools. Clear your browser data or press Forget this screen to remove it.',
  },
];
