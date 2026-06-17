import { redirect } from 'next/navigation';

// Root path just redirects to /login.
// In a real app you'd check a cookie/session here and redirect to /chat if logged in.
export default function HomePage() {
  redirect('/login');
}
