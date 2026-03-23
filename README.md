# RoastMyResume

Dark editorial AI resume analyzer with client-side PDF extraction and recruiter-style feedback.

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS + Framer Motion
- `pdfjs-dist` for local PDF extraction
- Client-side AI calls for Anthropic, OpenAI, and Gemini

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Privacy Model

- API keys are stored in `sessionStorage` only
- Resume text is extracted locally in the browser
- No backend upload route is used for analysis