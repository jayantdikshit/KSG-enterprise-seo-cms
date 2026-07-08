import { NextResponse, NextRequest } from 'next/server';



export default function proxy(request: NextRequest) {
  return NextResponse.next();
}
