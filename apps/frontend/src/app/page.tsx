'use client';
import { useAuth } from '@/lib/authContext';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const { user, isLoading, logout } = useAuth();
  if (!user)
    return (
      <div className="flex">
        <header className="flex flex-col justify-between">
          <h1>TEST</h1>

          <div>
            <Link href={'/login'}>Login</Link>
            <Link href={'/register'}>Register</Link>
          </div>
        </header>
      </div>
    );
  return (
    <div className="flex">
      <header className="flex flex-col justify-between">
        {isLoading && <b>User Data is Loading...</b>}
        {!isLoading && (
          <div>
            <b>{user.name}</b>
            <br />
            <p>{user.email}</p>
            <br />
            <div>
              <button onClick={logout}>Log Out</button>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
