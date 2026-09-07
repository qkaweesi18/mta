import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const p = await params;
  const provider = p.provider.toLowerCase();
  
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  // In a real application, you would exchange the 'code' for an access token
  // with the respective OAuth provider, then fetch the user's profile information.
  // Since we are mocking the OAuth flow completion because real client IDs are missing,
  // we will simulate a successful login with a mock email or by extracting some info if possible.

  let mockEmail = `user@${provider}.example.com`;

  try {
    // Check if user exists
    let userResult = await db.select().from(users).where(eq(users.email, mockEmail));
    let user = userResult[0];

    if (!user) {
      // Create a dummy user for OAuth
      const dummyPassword = await bcrypt.hash(crypto.randomUUID(), 10);
      const insertResult = await db.insert(users).values({ 
        email: mockEmail, 
        password: dummyPassword 
      }).returning();
      user = insertResult[0];
    }

    // Generate token
    const token = signToken({ userId: user.id, email: user.email });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    // Send success message to parent window and close popup
    return new NextResponse(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: '${token}' }, '*');
              window.close();
            } else {
              window.location.href = '/dashboard';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });

  } catch (error) {
    console.error('OAuth Callback Error:', error);
    return new NextResponse('Authentication failed', { status: 500 });
  }
}
