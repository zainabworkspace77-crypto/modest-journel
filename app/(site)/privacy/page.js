import { notFound } from 'next/navigation';
import StaticPage, { pageMeta } from '@/components/StaticPage';
export const generateMetadata = () => pageMeta('privacy');
export default function Page() { return <StaticPage slug="privacy" />; }
