import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Mock successful response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating service status:', error);
    return NextResponse.json(
      { error: 'Failed to update service status' },
      { status: 500 }
    );
  }
} 