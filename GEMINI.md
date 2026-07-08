# FFXIV-Character-Finder Project

## Project Overview

This is a full-stack web application designed to search and display detailed Final Fantasy XIV Online (FFXIV) character information. It scrapes and parses character sheets, gear setups, attributes, and class job levels directly from the official Lodestone portal.

- **Frontend:** Built with **Angular**, using TypeScript. It features a component-based autocomplete search form for FFXIV worlds/servers, and a premium dark-themed dashboard presenting equipment (with item level, glamour, dyes, and materias), core attributes, and progression levels.
- **Backend:** A Node.js Express server incorporating the **xivapi/nodestone** parsing engine. It handles scraping and parsing the Lodestone pages via static CSS selector configurations, returning clean JSON models to the client.
- **Styling:** The UI is styled with pure CSS (Inter and Cinzel typography), capturing the elegant, high-fantasy aesthetic of the official FFXIV interface with deep slate-navy colors and gold-trimmed borders.

## Building and Running

The application consists of two separate parts that must be run concurrently: the backend server and the frontend development server.

### 1. Running the Backend

The backend server is located in the `backend/` directory.

```bash
# Navigate to the backend directory
cd backend

# Install dependencies (only required on first run)
npm install

# Build the TypeScript files
npm run build

# Start the server
npm start
```

The server will start on `http://localhost:3000`.

### 2. Running the Frontend

The frontend is a standard Angular CLI project located at the root.

```bash
# Navigate to the project root directory
# (If you are in the backend directory, run: cd ..)

# Install dependencies (only required on first run)
npm install

# Start the Angular development server
npm start
```

The frontend application will be available at `http://localhost:4200/`.

## Development Conventions

- **API Interaction:** All communication with the Lodestone is handled by `WowApiService` (`src/app/wow-api.service.ts`), which sends requests to the local Express server proxy. It performs an initial name/world resolution using the `/Character/Search` endpoint before fetching full details via `/Character/:id`.
- **Component Structure:** 
  - `SearchFormComponent` (`src/app/search-form/`): Implements FFXIV worlds autocomplete filtering.
  - `CharacterSearchComponent` (`src/app/character-search/`): Coordinates loading state, error boundaries, and renders the rich adventurer profile dashboard.
- **Scraping Selectors:** The selectors are managed locally via the `lodestone-css-selectors` package in `backend/lodestone-css-selectors/` mapped in `backend/package.json` to stay immune to upstream breaking changes.
