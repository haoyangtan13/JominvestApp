import { handleApiRequest } from './_handler';

export async function POST(request: Request): Promise<Response> {
  return handleApiRequest(request);
}

export async function OPTIONS(request: Request): Promise<Response> {
  return handleApiRequest(request);
}
