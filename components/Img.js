// Responsive, lazy-loaded image. `img` = { url, thumb, alt, w, h }
export default function Img({ img, sizes = '(min-width: 900px) 33vw, 100vw', eager = false, className = '', ratio }) {
  if (!img?.url) return <div className={`ph ${className}`} style={ratio ? { aspectRatio: ratio } : undefined} aria-hidden="true" />;
  return (
    <img className={className} src={img.url} alt={img.alt || ''}
      srcSet={img.thumb ? `${img.thumb} 600w, ${img.url} 1600w` : undefined} sizes={sizes}
      width={img.w || undefined} height={img.h || undefined}
      loading={eager ? 'eager' : 'lazy'} decoding="async" fetchPriority={eager ? 'high' : undefined}
      style={ratio ? { aspectRatio: ratio, objectFit: 'cover', width: '100%' } : undefined} />
  );
}
