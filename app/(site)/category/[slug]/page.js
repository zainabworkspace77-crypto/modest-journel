import { notFound } from 'next/navigation';
import CategoryView from '@/components/CategoryView';
import { getCategories, getArticles } from '@/lib/data';

async function load(slug) {
  const cats = await getCategories();
  return { cats, cat: cats.find((c) => c.slug === slug && !c.parentId) };
}
export async function generateMetadata({ params, searchParams }) {
  const { cat } = await load(params.slug); if (!cat) return {};
  const p = parseInt(searchParams.page) > 1 ? `?page=${parseInt(searchParams.page)}` : '';
  return { title: { absolute: cat.seoTitle || cat.title }, description: cat.metaDescription || cat.description, alternates: { canonical: `/category/${cat.slug}${p}` } };
}
export default async function Page({ params, searchParams }) {
  const { cats, cat } = await load(params.slug); if (!cat) notFound();
  const arts = (await getArticles()).filter((a) => a.categoryId === cat.id);
  return <CategoryView cat={cat} cats={cats} articles={arts} page={searchParams.page} />;
}
