// Embedding provider controlled by EMBEDDING_PROVIDER env var.
// voyage (default) → voyage-3-large (1024 dims)
// openai          → text-embedding-3-large (1024 dims)

const PROVIDER = process.env.EMBEDDING_PROVIDER ?? "voyage";

async function embedVoyage(text: string): Promise<number[]> {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ input: [text], model: "voyage-3-large" }),
  });
  if (!res.ok) {
    throw new Error(
      `Voyage API error ${res.status}: ${await res.text()}`
    );
  }
  const data = (await res.json()) as {
    data: { embedding: number[] }[];
  };
  return data.data[0].embedding;
}

async function embedOpenAI(text: string): Promise<number[]> {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-3-large",
      dimensions: 1024,
    }),
  });
  if (!res.ok) {
    throw new Error(
      `OpenAI API error ${res.status}: ${await res.text()}`
    );
  }
  const data = (await res.json()) as {
    data: { embedding: number[] }[];
  };
  return data.data[0].embedding;
}

export async function embedQuery(text: string): Promise<number[]> {
  return PROVIDER === "openai" ? embedOpenAI(text) : embedVoyage(text);
}
