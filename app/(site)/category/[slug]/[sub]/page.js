import { notFound } from 'next/navigation';
import CategoryView from '@/components/CategoryView';
import { getCategories, getArticles } from '@/lib/data';

async function load({ slug, sub }) {
  const cats = await getCategories();
  const parent = cats.find((c) => c.slug === slug && !c.parentId);
  return { cats, parent, cat: parent && cats.find((c) => c.slug === sub && c.parentId === parent.id) };
}
export async function generateMetadata({ params, searchParams }) {
  const { cat, parent } = await load(params); if (!cat) return {};
  const p = parseInt(searchParams.page) > 1 ? `?page=${parseInt(searchParams.page)}` : '';
  return { title: { absolute: cat.seoTitle || `${cat.title} | ${parent.title}` }, description: cat.metaDescription || cat.description, alternates: { canonical: `/category/${parent.slug}/${cat.slug}${p}` } };
}
export default async function Page({ params, searchParams }) {
  const { cats, cat, parent } = await load(params); if (!cat) notFound();
  const arts = (await getArticles()).filter((a) => a.subcategoryId === cat.id);
  return <CategoryView cat={cat} parent={parent} cats={cats} articles={arts} page={searchParams.page} />;
}
