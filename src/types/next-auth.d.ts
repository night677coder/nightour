import { DefaultSession, DefaultUser } from 'next-auth';
import Spotify from 'next-auth/providers/spotify';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
  }

  interface User extends DefaultUser {
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
  }
}
