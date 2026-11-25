import { notFound } from 'next/navigation';
import StaticPage, { pageMeta } from '@/components/StaticPage';
export const generateMetadata = () => pageMeta('terms');
export default function Page() { return <StaticPage slug="terms" />; }
