import { CoreMessage, streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();

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
      generateImage: {
        description: "Generate an image according to the user's request",
        parameters: z.object({
          imgprompt: z.string().describe("Image generation prompt for AI"),
        }),
        execute: async ({ imgprompt }) => {
          try {
            const res = await fetch(
              "https://ai-image-api.xeven.workers.dev?model=flux-schnell&img?prompt=" + 
              encodeURIComponent(imgprompt)
            );
      
            if (!res.ok) {
              throw new Error(`Failed to generate image: ${res.status}`);
            }
      
            // Get the image data as a blob
            const imageBlob = await res.blob();
            
            // Convert blob to base64
            const base64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(imageBlob);
            });
      
            return {
              success: true,
              imageUrl: base64
            };
      
          } catch (error) {
            console.error(`Error generating image: ${error}`);
            return {
              success: false,
              error: "Failed to generate image"
            };
          }
        },
      },
    },
  });

  return result.toDataStreamResponse();
}
