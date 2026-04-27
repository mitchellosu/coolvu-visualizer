import "dotenv/config";
import express from "express";
import multer from "multer";

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

const FILMS = {
  darkvu20: {
    name: "DarkVu 20 Ceramic",
    prompt:
      "Apply a realistic dark charcoal ceramic window film (DarkVu 20) to all visible windows. The windows should appear deeply tinted and nearly opaque from the outside with a sleek, modern appearance.",
  },
  coolvu35: {
    name: "CoolVu 35 Ceramic",
    prompt:
      "Apply a realistic medium charcoal ceramic window film (CoolVu 35) to all visible windows. Keep a balanced appearance with moderate tint, some visibility, and tasteful residential privacy.",
  },
  coolvu50: {
    name: "CoolVu 50 Ceramic",
    prompt:
      "Apply a subtle light smoke ceramic film (CoolVu 50) to all visible windows. Tint should be minimal and refined, preserving natural glass clarity while still showing a slight premium upgrade.",
  },
  carbonbronze: {
    name: "CoolVu Carbon Bronze",
    prompt:
      "Apply a warm bronze carbon window film to all visible windows. The tint should have a classic bronze tone and look realistic for residential architecture.",
  },
  reflectivesilver: {
    name: "Reflective Silver",
    prompt:
      "Apply a reflective silver window film to all visible windows. The exterior should have a mirror-like effect with high reflectivity while keeping the home and surroundings otherwise unchanged.",
  },
  clearsafety: {
    name: "Clear Safety Film",
    prompt:
      "Apply a clear safety window film to all visible windows. Keep the windows looking almost unchanged with no obvious tint, only a clean and slightly enhanced finish.",
  },
};

function buildPrompt(filmPrompt) {
  return [
    "This is a photo of a residential home.",
    filmPrompt,
    "Keep the rest of the house exactly the same, including landscaping, architecture, lighting, and camera angle.",
    "Output should be photorealistic and suitable for a customer-facing window film visualization.",
  ].join(" ");
}

app.use(express.static("."));

app.get("/api/films", (_req, res) => {
  const films = Object.entries(FILMS).map(([id, value]) => ({
    id,
    name: value.name,
  }));
  res.json({ films });
});

app.post("/api/visualize", upload.single("image"), async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Server is missing OPENAI_API_KEY." });
    }

    const filmId = req.body.filmId;
    const film = FILMS[filmId];

    if (!film) {
      return res.status(400).json({ error: "Invalid film selection." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Missing image upload." });
    }

    const form = new FormData();
    form.append("model", "gpt-image-2");
    form.append("prompt", buildPrompt(film.prompt));
    form.append("size", "1536x1024");
    form.append(
      "image",
      new Blob([req.file.buffer], { type: req.file.mimetype }),
      req.file.originalname || "house-upload.png"
    );

    const openAiResponse = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
    });

    const payload = await openAiResponse.json();

    if (!openAiResponse.ok) {
      return res.status(openAiResponse.status).json({
        error: payload?.error?.message || "OpenAI request failed.",
      });
    }

    const imageB64 = payload?.data?.[0]?.b64_json;

    if (!imageB64) {
      return res.status(502).json({ error: "No image returned from OpenAI." });
    }

    return res.json({ imageB64 });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unexpected server error." });
  }
});

const port = Number(process.env.PORT || 4173);
app.listen(port, () => {
  console.log(`CoolVu visualizer server running at http://localhost:${port}`);
});
