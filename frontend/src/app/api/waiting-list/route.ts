import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Mock successful response for now
    const newEntry = {
      id: Date.now().toString(),
      customerName: body.customerName,
      petName: body.petName,
      service: body.service,
      contactNumber: body.contactNumber,
      isServiced: false,
      orderIndex: 0,
      createdAt: new Date(),
      dayListId: body.dayListId
    };

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error('Error adding entry:', error);
    return NextResponse.json(
      { error: 'Failed to add entry' },
      { status: 500 }
    );
  }
} 