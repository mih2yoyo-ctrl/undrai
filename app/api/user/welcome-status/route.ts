
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ hasSeenWelcome: true });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ hasSeenWelcome: true });
    }

    return NextResponse.json({ hasSeenWelcome: user.hasSeenWelcome });
  } catch (error) {
    console.error('Error checking welcome status:', error);
    return NextResponse.json({ hasSeenWelcome: true });
  }
}
