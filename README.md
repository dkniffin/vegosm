# vegosm

A map of vegan and vegetarian restaurants using OpenStreetMap data.

## Setup

### 1. Install dependencies

```sh
npm install
```

### 2. Configure environment variables

Copy the example env file and fill in your API key:

```sh
cp .env.example .env
```

Then edit `.env`:

```
STADIA_API_KEY=your_api_key_here
```

A [Stadia Maps](https://stadiamaps.com/) API key is required for map tiles. Sign up for a free account at stadiamaps.com — the free tier is sufficient for development and low-traffic use.

### 3. Run locally

```sh
npm run dev
```

This starts the dev server and watches for JS/CSS changes.

## Building for production

```sh
STADIA_API_KEY=your_key npm run build
```

Or export the variable in your shell/CI environment before running `npm run build`.
