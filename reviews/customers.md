# Mock-customer panel (Kim, 2026-10-21)
Each persona used the local Bingemind build at their own screen (Chrome emulation of size and pixel ratio), opened the panel, matched the card, read the result and pressed Copy. The match was scripted to an exact fit for their real panel, so results show the maths, not hand accuracy, and match time was not measured. Aisha also used playwright-cli with the iPhone 13 device (664 px tall window). Scores are after the fixes; the first-run problem is in brackets.

1. **Dana, 34, laptop buyer, 15.6 in Windows laptop at 125%.** "I wanted the size for a sleeve. One card match and it said 15.6 in, closest common size 15.6. The other site I tried just said 13.4 and I would have bought the wrong sleeve." Would bookmark. 9/10.
2. **Marcus, 41, monitor shopper, 27 in 1440p.** "27.0 in, 109 PPI, and the table shows how big a 31.5 is. I'd like a 'how much bigger is 32' line, but the table does it." 8/10.
3. **Priya, 29, designer, MacBook Pro 14.** "14.2 in is right. It used to say closest 14 in; now it says 14.2, 14 in pro laptops. 254 PPI matches Apple's spec at my default setting, and the label says rendered pixels, so I know a scaled mode would change it." The 1.54:1 shape is correct but she would like a name for it. 8/10.
4. **Mr. Alvarez, 52, teacher, 11.6 in school Chromebook.** "No install, which matters on a managed laptop. 11.6 in, small school laptops. What if a student has no card? The panel only talked about cards." (Now it points to a coin or paper in the ruler.) 8/10.
5. **Joan, 71, iPad 10.2.** (Before: card stood on its short side, and the result said 'not close to a common size, check the card match', which worried her.) "Now the card lies flat, the button is big, and it says 10.2 in, older standard tablets. I trust it." 8/10.
6. **Tyler, 19, gamer, 24.5 in 1080p.** (Before: "closest 23.8 in, sold as 24" which is not his monitor.) "Now 24.5, gaming monitors sold as 25. Would like refresh rate here too." 7/10.
7. **Sam, 36, web developer, MacBook Air.** "Screen, viewport, DPR, device pixels, available area in one grid, and Copy gives plain text. I'd use it without the card at all. Matching once also fixed my online ruler." 9/10.
8. **Aisha, 24, iPhone 13.** (Before: on her phone the green 'My card matches' button was half hidden under the notes.) "Card turned on its side, matched, 6.1 in. Quick." 8/10.
9. **Ben, 45, iPhone 11 Pro.** (Before: closest 6.1.) "5.9 in, closest 5.8. Right model for my screen protector." His 375x812 window showed the main button fine. 8/10.
10. **Rosa, 30, Galaxy S23 Ultra.** "6.8 in, large Android phones. Good." 8/10.

Average 8.1 / 10. Done in under 30 seconds: not timed (scripted match). Would they click over rivals on Google: the honest "Measured with a card" angle won 7 of 10; 3 (Tyler, Sam, Marcus) said a guess in the snippet looks faster.

## Ranked changes
| Rank | Change | Asked by | Status |
|---|---|---|---|
| must | Missing common sizes gave wrong "closest size" or a false "check your match" | 5 (Priya, Joan, Tyler, Ben, Rosa) | Fixed |
| must | Main button hidden on short phone windows | 1 (Aisha) | Fixed |
| should | Tablet card on short side | 1 (Joan) | Fixed |
| should | What if I have no card? | 1 (Mr. Alvarez) | Fixed (coin or paper in the ruler) |
| nice | Refresh rate | 1 (Tyler) | Not done: spec non-goal (frame timing is noisy) |
| nice | "How much bigger is X than mine" line | 1 (Marcus) | Not done: table covers it; later idea |
