import '../Blog.css';

export function BlogImage({
  src,
  alt,
  width = '100%',
}: {
  src: string;
  alt: string;
  width?: string;
}) {
  return (
    <div className="blog-image-wrapper" style={{ width }}>
      <img src={src} alt={alt} className="blog-image" loading="lazy" />
    </div>
  );
}

export function BlogImages({
  images,
}: {
  images: { src: string; alt: string }[];
}) {
  return (
    <div className="blog-images-grid">
      {images.map((img, idx) => (
        <img key={idx} src={img.src} alt={img.alt} className="blog-image" loading="lazy" />
      ))}
    </div>
  );
}

export function BlogEmoji({
  src,
  alt,
  size = 'small',
}: {
  src: string;
  alt: string;
  size?: 'small' | 'medium' | 'large';
}) {
  return <img src={src} alt={alt} className={`blog-emoji ${size}`} />;
}
