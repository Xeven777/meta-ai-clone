import {
  CoreMessage,
  streamText,
} from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";

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
    model: groq("llama3-groq-70b-8192-tool-use-preview"),
    system: "You are a helpful assistant.",
    messages,
    maxSteps: 4,

    tools: {
      getWeather: {
        description: "Get the weather for a location",
        parameters: z.object({
          city: z.string().describe("The city to get the weather for"),
        }),
        execute: async ({ city }) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${city}&format=json&limit=1`
            );
            const data = await response.json();
            const latitude = data[0].lat;
            const longitude = data[0].lon;

            const weatherResponse = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto`
            );
            const weatherData = await weatherResponse.json();

            const temperature = weatherData.current.temperature_2m;
            const description = weatherData.current.weather[0].description;

            return `It is currently ${temperature} °C and ${description} in ${city}!`;
          } catch (error) {
            console.error(`Error getting weather for ${city}: ${error}`);
            return `Error getting weather for ${city}.`;
          }
        },
      },
    },
  });

  return result.toDataStreamResponse();
}
