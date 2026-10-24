import { handle } from '../server/breakdown'

export async function POST(request: Request) {
  return handle(request)
}
