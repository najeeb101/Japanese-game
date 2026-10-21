# Game Jeopardy

**Game Jeopardy** is a browser-based Japanese gaming quiz game presented at the **Gamers Week** event for a Japan Club and an Esports Club. It presents a Jeopardy-style board with questions about games, characters, consoles, items, and other gaming topics.

## Features

- Seven categories (Silhouette, Sound, Character, Item, Console, Biome and the new Emoji "guess the character" category), each with 60 numbered questions: the board shows only the categories, and the numbers 1-60 appear once you open one
- Hint button that turns the question into four multiple-choice answers
- Correct answer button plus win and lose animations (a wrong choice is the only way to lose)
- Host view for selecting questions, giving hints and marking answers
- TV/audience view that follows the host in another browser window
- One Persona 5 theme: red, black and white, halftone dots, stars, ransom-note lettering, a Phantom Thief mask on every category and a character beside each question bubble
- Persona 5 clips for the question flash and the win/lose animations
- "We will be right back" TV screen (brb.html, or the host button) for when the booth is empty
- Question images, character art, backgrounds, and sound effects
- Local browser storage for used questions and synchronized game state
- Responsive layout for desktop displays, projectors, tablets, and phones

## Play online

The game can be hosted as a static site with GitHub Pages:

```text
https://najeeb101.github.io/Japanese-game/
```

## Running locally

Because the game loads local assets and uses browser storage, run it through a local web server rather than opening the HTML files directly.

For example, with Python installed:

```powershell
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

No build step or package installation is required.

## How to play

1. Open `index.html` to reach the main menu.
2. Select **Host View**.
3. Choose a category, then a number from 1 to 60.
4. Press **Hint** to show four choices, or **Correct answer** when the player gets it right. Picking a wrong choice plays the lose animation and shows the right answer.
5. Use **Reset** on the board when starting a new game.

### Using a second display

To show the board and questions on a TV or projector:

1. Open the game on the host computer.
2. Open the same deployed URL in a second tab or window for the audience display.
3. Add `?tv=1` to the audience URL, for example:

   ```text
   https://najeeb101.github.io/Japanese-game/?tv=1
   ```

4. Keep both windows open in the same browser profile.

The host and audience windows communicate through browser `localStorage` events, so both windows must use the same origin. Do not mix a local URL with the GitHub Pages URL.

## Project structure

```text
.
├── index.html       # Main menu
├── host.html        # Host controls and question panel
├── board.html       # Category board
├── category.html    # Numbers 1-60 for one category
├── question.html    # Question and answer display
├── brb.html         # "We will be right back" screen
└── assets/
    ├── common.js    # Shared state, styles, and host/TV communication
    ├── data.js      # Quiz question data
    ├── style.css    # Shared styles
    ├── audio/       # Sound effects
    ├── img/         # Question and character artwork
    ├── p5/          # Persona 5 backgrounds, clips and masks/characters (p5/cut)
    └── theme/       # Mouse cursors
```

## Deployment with GitHub Pages

This repository is configured as a static website. To publish it with GitHub Pages:

1. Open the repository **Settings** on GitHub.
2. Select **Pages**.
3. Set the source to **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder.
5. Save the settings.

Future changes can be published with:

```powershell
git add .
git commit -m "Describe your changes"
git push
```

## License

No license has been specified for this project yet.
