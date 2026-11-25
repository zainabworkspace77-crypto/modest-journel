import { notFound } from 'next/navigation';
import StaticPage, { pageMeta } from '@/components/StaticPage';
export const generateMetadata = () => pageMeta('about');
export default function Page() { return <StaticPage slug="about" />; }
