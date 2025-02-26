import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // For now, return mock data until backend is ready
    return NextResponse.json({
      dayListId: '1',
      entries: [
        {
          id: '1',
          customerName: 'John Doe',
          petName: 'Max',
          service: 'Grooming',
          contactNumber: '123-456-7890',
          isServiced: false,
          orderIndex: 0,
          createdAt: new Date(),
          dayListId: '1'
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching today\'s list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today\'s list' },
      { status: 500 }
    );
  }
} 