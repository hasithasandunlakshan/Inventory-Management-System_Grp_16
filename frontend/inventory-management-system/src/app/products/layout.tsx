export default function ProductLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <div className='w-full'>
      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
