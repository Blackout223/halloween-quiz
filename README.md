# 🎃 The Haunted Pub Quiz

A Halloween pub quiz for a small quiz night. One person hosts and reads the questions out. Quizzers either join on their own phones (type a name, type answers, scores add up automatically) or play with pen and paper.

Plain HTML, CSS and vanilla JavaScript. No frameworks, no build step, no accounts.

## Files

```
index.html          Page shell, background effects, header and footer
styles.css          All styling, including reduced-motion and print styles
app.js              Host and quizzer screens, marking, connections, printing, saving
data/questions.js   All rounds and questions (edit this to change the quiz)
README.md           This file
```

## Two ways to play

**📱 Quizzers join on their phones** (needs the quiz online, see "Deploying to GitHub Pages" below)

1. Open the quiz's web address, choose **Host**, keep "Quizzers join on their phones" selected, pick your rounds and press **Open the room**.
2. The lobby shows a 5-character **room code**, a **QR code** and a join link. These point to the address you're hosting from. If you host from a copy on your own computer (where the address is `localhost` or a file), type the quiz's online address into **Quiz web address** in the lobby, or set it once as `siteUrl` at the top of `data/questions.js`, and the QR code will send phones there instead. Quizzers scan the QR code (or open the address, choose **Quizzer** and enter the code), type their name and join. Their names appear in the lobby.
3. Press **Start quiz** and read each question out. Quizzers only see "Question 5" and an answer box: the questions never appear on their phones, and their phones never download the question file. The host screen shows how many have answered.
4. When you press **Reveal answers**, that round's answers are **locked**. On each answer screen you see every quizzer's answer, already marked:
   - Exact matches and small typos ("Romainia", "sythe") are marked right automatically, ignoring capitals, accents, punctuation and "the/a/an".
   - Answers that are nearly right are highlighted orange as **close: check**.
   - Tap **✓ / ✗** to approve or reject any answer yourself. Years and numbers must match exactly.
5. Scores stay secret until the end (the end-of-round screen has a "host only" peek). After the last round the **final leaderboard** appears on your screen and on every quizzer's phone.

If a quizzer's phone locks or refreshes, they reconnect automatically and their answers are kept. If the host refreshes, the room reopens with the same code after a few seconds.

**📝 Pen and paper**

Choose "Pen and paper" on the setup screen. You read the questions out, reveal the answers at the end of each round, and everyone keeps their own score on paper.

In the **Who Am I?** round each question has four clues, hardest first. Press → (or **Next clue**) to show the next clue.

### Keyboard controls (host)

| Key | Action |
| --- | --- |
| `→` | Next (question, clue, answer or screen) |
| `←` | Back |
| `R` | Reveal answers (asks first if you're not on the last question yet) |
| `F` | Toggle fullscreen |

### How the phone connection works

Phones connect directly to the host's browser using WebRTC, set up through the free public PeerJS service (`0.peerjs.com`). Nothing to sign up for. Things to know:

- The host must keep the quiz open on their device for the whole quiz (keep the screen awake).
- Everyone needs internet (pub wifi or mobile data). Very rarely a strict network blocks direct connections; if one phone can't join, try switching it between wifi and mobile data.
- The question file is public on your website, so a determined quizzer could look it up. The app never sends questions to quizzers.

### Saving

Your place in the quiz, the quizzers and their answers are saved in the browser's `localStorage`, so a refresh doesn't lose the game. Use **New game** in the header to start again. Quizzers who joined before stay in the list; remove anyone with ✕ in the lobby.

### Printing

On the host setup screen:

- **Print answer sheet:** one blank sheet with a name line and numbered lines for every selected round (for pen-and-paper games).
- **Print host answer key:** every question with the answer, "also accept" notes, difficulty and explanation.

## Deploying to GitHub Pages

Quizzers' phones need a real web address, so put the quiz online before a phone game. (Double-clicking `index.html` on your computer still works for a pen-and-paper game.)

1. Create a new repository on GitHub (it can be public, or private if your plan supports Pages for private repositories).
2. Upload all the files, keeping the `data` folder: `index.html`, `styles.css`, `app.js`, `data/questions.js`, `README.md`.
   - On the website: **Add file → Upload files**, then drag the files and the `data` folder in.
   - Or with git:
     ```bash
     git init
     git add .
     git commit -m "Halloween pub quiz"
     git branch -M main
     git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
     git push -u origin main
     ```
3. In the repository go to **Settings → Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, pick **main** and **/ (root)**, then **Save**.
4. After a minute or two the site is live at `https://YOUR-USERNAME.github.io/YOUR-REPO/`.

All paths are relative, so nothing needs changing for Pages.

## Adding, editing or swapping questions

Everything lives in `data/questions.js`. Each question looks like this:

```js
{
  id: "gk-11",                 // any unique text
  round: "general",            // must match a round id in QUIZ_ROUNDS
  difficulty: "medium",        // "easy", "medium" or "hard"
  question: "Your question here?",
  answer: "The answer",
  acceptAlso: ["Another accepted answer"],   // or [] if none
  explanation: "One or two sentences shown on the reveal."
}
```

- Questions are shown in the order they appear in the file within their round.
- A round doesn't have to have exactly 10 questions; the app counts whatever is there.
- To make a clue-by-clue question (like the Who Am I? round), add a `clues` array, hardest clue first:
  ```js
  clues: ["Hard clue", "Medium clue", "Easier clue", "Giveaway clue"],
  ```
- To add a whole new round, add an entry to `QUIZ_ROUNDS` at the top of the file:
  ```js
  { id: "monsters", title: "Monster Mash", emoji: "🧟", description: "All about monsters." }
  ```
  then give its questions `round: "monsters"`. It appears on the setup screen automatically.
- Use straight double quotes `"` around each piece of text. If you need a quote mark inside, use curly quotes (‘ ’ “ ”) or an apostrophe `'`.
- If a page refresh shows an old round order after you edit rounds, press **New game**.

Tip: after editing, open `index.html` and print the host answer key to proofread everything in one place.

## Accessibility and design notes

- Large text that scales up on big screens, high-contrast colours and visible focus outlines.
- Semantic headings, labelled form controls and a screen-reader status area for clue and timer announcements.
- The floating bats, fog, flickering candle and other animation switch off when the device has "reduce motion" turned on.
- No images or licensed assets: decorations are CSS, inline SVG and emoji.
