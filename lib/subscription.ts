
import { db } from './db';

export async function isPremiumUser(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) return false;

  // Check if user has active subscription
  if (user.subscription?.status === 'active' && user.subscription.currentPeriodEnd) {
    if (new Date(user.subscription.currentPeriodEnd) > new Date()) {
      return true;
    }
  }

  // Check if user has premium time from watching ads
  if (user.premiumUntil && new Date(user.premiumUntil) > new Date()) {
    return true;
  }

  return false;
}

export async function getRemainingAdFreeTime(userId: string): Promise<number> {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.premiumUntil) return 0;

  const now = new Date();
  const premiumUntil = new Date(user.premiumUntil);

  if (premiumUntil <= now) return 0;

  // Return remaining minutes
  return Math.floor((premiumUntil.getTime() - now.getTime()) / 1000 / 60);
}

export async function addAdFreeTime(userId: string, minutes: number): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) return;

  const now = new Date();
  let newPremiumUntil: Date;

  if (user.premiumUntil && new Date(user.premiumUntil) > now) {
    // Add to existing time
    newPremiumUntil = new Date(new Date(user.premiumUntil).getTime() + minutes * 60 * 1000);
  } else {
    // Start new time
    newPremiumUntil = new Date(now.getTime() + minutes * 60 * 1000);
  }

  await db.user.update({
    where: { id: userId },
    data: { premiumUntil: newPremiumUntil },
  });
}
