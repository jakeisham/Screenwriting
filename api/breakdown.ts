import { handle } from '../server/breakdown.js'

export async function POST(request: Request) {
  return handle(request)
}
