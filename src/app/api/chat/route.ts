import { CoreMessage, streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system:
      "You are a helpful assistant named Meta. You are made by Anish. You can answer everything that is being asked. and other than those, You can also generate images, find and get images from internet and get the weather for a location but only if asked. Otherwise , answer everythig else that you are asked!",
    messages,
    maxTokens: 800,
    maxSteps: 5,
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

            return {
              temperature,
              city,
            };
          } catch (error) {
            console.error(`Error getting weather for ${city}: ${error}`);
            return `Error getting weather for ${city}.`;
          }
        },
      },
      getImage: {
        description: "find and get an image according to the user's request",
        parameters: z.object({
          imgprompt: z.string().describe("Query to search for an image"),
        }),
        execute: async ({ imgprompt }) => {
          try {
            const response = await fetch(
              `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
                imgprompt
              )}&per_page=1`,
              {
                headers: {
                  Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
                },
              }
            );
            const data = await response.json();
            return {
              markdownResponse: `![${imgprompt}](${data.results[0].urls.regular})`,
            };
          } catch (error) {
            console.error(`Error generating image: ${error}`);
            return {
              success: false,
              error: "Failed to generate image",
            };
          }
        },
      },
      generateAIImage: {
        description:
          "Generate AI image according to the user's request only if asked",
        parameters: z.object({
          imgprompt: z.string().describe("Prompt to generate an image"),
        }),
        execute: async ({ imgprompt }) => {
          try {
            return {
              success: true,
              message: `Generated AI image for prompt: ${imgprompt}`,
            };
          } catch (error) {
            console.error(`Error generating AI image: ${error}`);
            return {
              success: false,
              error: "Failed to generate AI image",
            };
          }
        },
      },
    },
  });

  return result.toDataStreamResponse();
}
