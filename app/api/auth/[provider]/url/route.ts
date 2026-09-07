import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const p = await params;
  const provider = p.provider.toLowerCase();
  
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const redirectUri = `${protocol}://${host}/api/auth/${provider}/callback`;

  let authUrl = '';

  switch (provider) {
    case 'google':
      if (process.env.GOOGLE_CLIENT_ID) {
        const googleParams = new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'email profile',
          access_type: 'offline',
          prompt: 'consent'
        });
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${googleParams.toString()}`;
      } else {
        authUrl = `${redirectUri}?code=mock_local_auth_code`;
      }
      break;

    case 'facebook':
      if (process.env.FACEBOOK_CLIENT_ID) {
        const fbParams = new URLSearchParams({
          client_id: process.env.FACEBOOK_CLIENT_ID,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'email public_profile'
        });
        authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${fbParams.toString()}`;
      } else {
        authUrl = `${redirectUri}?code=mock_local_auth_code`;
      }
      break;

    case 'pinterest':
      if (process.env.PINTEREST_CLIENT_ID) {
        const pinParams = new URLSearchParams({
          client_id: process.env.PINTEREST_CLIENT_ID,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'user_accounts:read',
          state: 'random_state_string'
        });
        authUrl = `https://www.pinterest.com/oauth/?${pinParams.toString()}`;
      } else {
        authUrl = `${redirectUri}?code=mock_local_auth_code`;
      }
      break;

    default:
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
  }

  return NextResponse.json({ url: authUrl });
}
