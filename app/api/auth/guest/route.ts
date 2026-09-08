import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const guestId = crypto.randomUUID();
    const email = `guest-${guestId}@guest.local`;
    const password = await bcrypt.hash(crypto.randomUUID(), 10);
    const result = await db.insert(users).values({ email, password }).returning();
    const user = result[0];
    const token = signToken({ userId: user.id, email: user.email, guest: true });
    const cookieStore = await cookies();

    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return NextResponse.json(
      { token, user: { id: user.id, email: user.email, guest: true } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Guest access error:', error);
    return NextResponse.json({ error: 'Unable to create guest profile' }, { status: 500 });
  }
}
