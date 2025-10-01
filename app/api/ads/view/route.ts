
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { addAdFreeTime } from '@/lib/subscription';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { adType, completed } = await req.json();

    // Create ad view record
    const adView = await db.adView.create({
      data: {
        userId: user.id,
        adType,
        completed,
        rewardMinutes: completed && adType === 'rewarded' ? 10 : 0,
      },
    });

    // If ad was completed and is rewarded, add ad-free time
    if (completed && adType === 'rewarded') {
      await addAdFreeTime(user.id, 10);
    }

    return NextResponse.json({ success: true, adView });
  } catch (error) {
    console.error('Error recording ad view:', error);
    return NextResponse.json(
      { error: 'Failed to record ad view' },
      { status: 500 }
    );
  }
}
