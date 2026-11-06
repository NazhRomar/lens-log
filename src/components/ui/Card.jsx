export default function Card({ as: Tag = 'section', className = '', children, ...rest }) {
  return (
    <Tag className={`rounded-[20px] border border-line bg-surface p-5 ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
