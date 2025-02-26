import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Mock successful response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering list:', error);
    return NextResponse.json(
      { error: 'Failed to reorder list' },
      { status: 500 }
    );
  }
} 