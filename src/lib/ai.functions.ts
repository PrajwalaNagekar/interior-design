import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ mode: z.enum(["advisor", "whatsapp"]), summary: z.string().max(20000) });

const PROMPTS = {
  advisor:
    "You are a senior pricing analyst for an Indian luxury interior design studio. Review the quotation data and reply in concise markdown-free plain text with these headings on their own lines: VERDICT, PRICING CHECKS, RISKS, MARGIN SUGGESTION, UPSELL IDEAS. Use INR (₹). Max 180 words. Be specific to the items listed.",
  whatsapp:
    "Write a warm, professional WhatsApp message (max 70 words, 1-2 tasteful emojis) from the studio to the customer sharing their interior design quotation. Mention project type, total and highlight 1-2 rooms. End with the link placeholder {LINK}. Plain text only.",
};

export const askAI = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { ok: false as const, error: "AI key is not configured on the server." };
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions: PROMPTS[data.mode],
        input: data.summary,
        reasoning: { effort: "low" },
        store: false,
        stream: true,
      }),
    });
    if (!res.ok || !res.body) {
      const msg = res.status === 429 ? "AI is busy, try again in a moment." : res.status === 402 ? "AI credits exhausted. Add credits in workspace settings." : `AI request failed (${res.status}).`;
      return { ok: false as const, error: msg };
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "", text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const l of lines) {
        if (!l.startsWith("data:")) continue;
        const p = l.slice(5).trim();
        if (!p || p === "[DONE]") continue;
        try {
          const ev = JSON.parse(p);
          if (ev.type === "response.output_text.delta") text += ev.delta;
          if (ev.type === "error" || ev.type === "response.failed") return { ok: false as const, error: "AI could not complete the request." };
        } catch { /* partial */ }
      }
    }
    return text ? { ok: true as const, text: text.trim() } : { ok: false as const, error: "AI returned no answer." };
  });
