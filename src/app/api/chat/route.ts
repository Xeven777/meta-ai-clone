import { OpenAIStream, StreamingTextResponse } from "ai";
import { openai } from "@ai-sdk/openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { messages, audioBlob } = await req.json();

  let userMessage = messages[messages.length - 1].content;

  if (audioBlob) {
    // In a real implementation, you would process the audio blob here
    // For now, we'll just use a dummy transcription
    userMessage = "This is a dummy transcription of the voice message.";
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    stream: true,
    messages: [
      ...messages.slice(0, -1),
      { role: "user", content: userMessage },
    ],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
