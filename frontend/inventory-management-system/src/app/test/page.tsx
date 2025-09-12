export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-red-600">TEST PAGE WORKING</h1>
      <p>If you can see this, Next.js is working correctly.</p>
      <p>Current time: {new Date().toISOString()}</p>
    </div>
  );
}
