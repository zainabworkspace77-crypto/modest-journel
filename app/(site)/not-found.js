import Link from 'next/link';
export const metadata = { title: { absolute: 'Page not found' }, robots: { index: false } };
export default function NotFound() {
  return (<div className="wrap narrow static"><h1>Page not found</h1>
    <p className="lede">The page you are looking for has moved or does not exist.</p>
    <Link href="/" className="btn">Back to home</Link></div>);
}
