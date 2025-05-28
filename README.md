# WordCombo.app

[Play Now → https://wordcombo.app](https://wordcombo.app)

A daily compound-word puzzle game built with React, Vite, Tailwind CSS, and Supabase. Guess a chain of seven linked compound words by typing each word in sequence, with progressively revealed letters. Track your streak, share your results, and come back every day for a fresh challenge!

---

## 🎮 Features

* **Daily Puzzle**  
  A new 7-word compound chain is published each calendar day on [wordcombo.app](https://wordcombo.app).

* **Progressive Hints**  
  Incorrect guesses reveal letters one by one to help you deduce the word.

* **Streak Tracking**  
  Your consecutive-day completion streak is saved and displayed.

* **Local Persistence**  
  Game state and stats (attempts, visits, completes, streak) are stored in `localStorage`.

* **Shareable Results**  
  Copy your results summary to clipboard and challenge friends on social media.

* **Analytics Logging**  
  Events (`visit`, `attempt`, `complete`, `share`) are logged to Supabase for private insights.

---

## 🛠️ Tech Stack

* **Framework:** React + Vite
* **Styling:** Tailwind CSS
* **Backend & Analytics:** Supabase (PostgreSQL + JS SDK)
* **Hosting:** Netlify, custom domain: **wordcombo.app**

---

## 🚀 Quick Start (for Local Development)

> *Only needed if you want to tinker. Otherwise, just play at [https://wordcombo.app](https://wordcombo.app)!*

1. **Clone the repo**

   ```bash
   git clone https://github.com/NguyenHChinh/wordcombo.git
   cd wordcombo
   ```
2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```
3. **Configure environment**
   Create a `.env` file in project root:

   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
   ```
4. **Run locally**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Then open [http://localhost:5173](http://localhost:5173) to preview.

---

## 📐 Project Structure

```
.
├── public
│   └── chain.png          # favicon
├── src
│   ├── App.jsx            # main game logic & UI
│   ├── supabase.js        # Supabase client setup
│   ├── utils
│   │   └── analytics.js   # logEvent wrapper
│   ├── HowToPlayModal.jsx
│   ├── AboutModal.jsx
│   ├── PrivacyModal.jsx
│   └── App.css            # custom Tailwind/CSS overrides
├── .env                   # environment variables (gitignored)
├── index.html
└── package.json
```

---

## 📈 Analytics & Data

Events logged to Supabase’s `analytics` table:

* **visit:** first page load each day
* **attempt:** first guess attempt each day
* **complete:** puzzle completion with `{ guesses, success }` metadata
* **share:** when user clicks “Share” button

---

## 🌐 Deployment

This site is already live at **[https://wordcombo.app](https://wordcombo.app)**!
Behind the scenes:

* **Build command:** `npm run build`
* **Publish directory:** `dist/`
* **Environment variables:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

Feel free to share the link, no signup required to play!

---

## 📞 Contact

Made with ❤️ by Chinh Nguyen  
Email: [contact@chinhnguyen.dev](mailto:contact@chinhnguyen.dev)  
Portfolio: [https://chinhnguyen.dev](https://chinhnguyen.dev)  
GitHub: [https://github.com/NguyenHChinh/wordcombo](https://github.com/NguyenHChinh/wordcombo)
