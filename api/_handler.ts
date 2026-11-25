import { handleWorkerRequest } from '../worker/src/index';

export async function handleApiRequest(request: Request): Promise<Response> {
  return handleWorkerRequest(request, {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN,
  });
}
