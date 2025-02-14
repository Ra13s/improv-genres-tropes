# Film Genre Improv app

A small web app for randomly generating a film or TV **genre** along with a random subset of **tropes**. You can choose to display **all** tropes for the chosen genre, or only **2** at a time (in which case the app ensures each 2-trope combination is shown without repeats in each cycle).

**Disclaimer**: This project was mostly written by ChatGPT.



Access the live app here: [Film Genres Improv](https://ra13s.github.io/improv-genres-tropes/)

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Getting Started](#getting-started)
4. [Usage](#usage)
5. [Customizing](#customizing)
6. [Credits](#credits)
7. [License](#license)

---

## Overview

This app randomly picks a film/TV genre from a predefined list and displays either:

- **2 random tropes** from that genre (cycling through all pairs, no immediate repeats).
- **All tropes** from that genre.

It is primarily designed to be a fun writing prompt or brainstorming tool. It also allows language switching between **Estonian** and **English**, showing different sets of genres and tropes according to the chosen language.

---

## Features

- **Random Genre:** Shuffles among various genres, ensuring each genre will appear before cycling again.
- **Random Tropes (No Repeat in a Cycle):** If "Show 2" is selected, each pair of tropes appears once per cycle, then repeats only after you’ve exhausted all possible pairs.
- **Language Switch:** Toggle between Estonian (`et`) or English (`en`) to load different sets of genre data.
- **Local Storage:** Your settings (language choice, trope limit) are persisted in `localStorage`.
- **Simple Frontend:** Everything runs in the browser—no build step or server required.

---

## Getting Started

1. **Clone or download** this repository.
2. Open `index.html` in your web browser (Chrome, Firefox, Safari, etc.).
3. By default, you will see a randomly selected genre and set of tropes immediately.

There is **no build process**—the app is self-contained in HTML, CSS, and JavaScript.

---

## Usage

1. **Shuffle Genre**: Picks a new random genre from the internal list and displays it.  
2. **Shuffle Tropes**: For the currently displayed genre, cycles to the next pair (if "Show 2") or re-displays all tropes (if "Show All").  
3. **Show Settings**: Toggle the Settings panel at the bottom to:
   - **Select Language** (Estonian or English).
   - **Select Trope Limit** (2 or all).
   - Click **Save Settings** to apply changes. The app will immediately shuffle to a new random genre.

---

## Customizing

### Adding or Editing Genres & Tropes

- The app references two JavaScript files:
  
  - `genres_et.js` (for Estonian)
  - `genres_en.js` (for English)

- Each file defines an array of `genre` objects, each with:
  
  ```js
  {
    name: "Genre Name",
    description: "Short description",
    tropes: [
      "Trope 1",
      "Trope 2",
      ...
    ]
  }
  ```
