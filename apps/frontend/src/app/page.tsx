import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex">
      <header className="flex flex-col justify-between">
        <h1>TEST</h1>

        <div>
          <Link href={'/login'}>Login</Link>
          <Link href={'/register'} >Register</Link>
        </div>
      </header>
    </div>
  );
}
