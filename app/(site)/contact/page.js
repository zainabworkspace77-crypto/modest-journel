import ContactForm from '@/components/ContactForm';
import Breadcrumbs from '@/components/Breadcrumbs';
export const metadata = { title: { absolute: 'Contact' }, description: 'Get in touch with us.', alternates: { canonical: '/contact' } };
export default function Page() {
  return (
    <div className="wrap narrow static">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Contact' }]} />
      <h1>Contact</h1>
      <p className="lede">Questions, collaborations or feedback: we would love to hear from you.</p>
      <ContactForm />
    </div>
  );
}
