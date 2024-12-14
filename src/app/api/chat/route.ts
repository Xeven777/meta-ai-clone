import { CoreMessage, streamText } from "ai";
import { groq } from "@ai-sdk/groq";

export async function POST(req: Request) {
  // const { messages, audioBlob } = await req.json();

  const { messages }: { messages: CoreMessage[] } = await req.json();

  // let userMessage = messages[messages.length - 1].content;

  // if (audioBlob) {
  //   // In a real implementation, you would process the audio blob here
  //   // For now, we'll just use a dummy transcription
  //   userMessage = "This is a dummy transcription of the voice message.";
  // }

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: "You are a helpful assistant.",
    messages,
  });

  return result.toDataStreamResponse();
}
