# Game Jeopardy

**Game Jeopardy** is a browser-based Japanese gaming quiz game presented at the **Gamers Week** event for a Japan Club and an Esports Club. It presents a Jeopardy-style board with questions about games, characters, consoles, items, and other gaming topics.

## Features

- 40 questions organized into four board ranges
- Host view for selecting questions and revealing answers
- TV/audience view that follows the host in another browser window
- Three visual styles: Persona 3, Persona 4, and Persona 5
- Question images, character art, backgrounds, and sound effects
- Local browser storage for used questions, selected style, and synchronized game state
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
3. Choose a question from the board.
4. Use the host controls to reveal the answer and move to the next question.
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
├── board.html       # Question board
├── question.html    # Question and answer display
└── assets/
    ├── common.js    # Shared state, styles, and host/TV communication
    ├── data.js      # Quiz question data
    ├── style.css    # Shared styles
    ├── audio/       # Sound effects
    ├── img/         # Question and character artwork
    └── theme/       # Style backgrounds and visual assets
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
