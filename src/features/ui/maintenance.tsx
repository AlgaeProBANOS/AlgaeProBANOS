export default function MaintenancePage(): JSX.Element {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100 text-center">
      <h1 className="text-4xl font-bold text-gray-600">We are doing maintenance</h1>
      <p className="mt-4 text-lg text-gray-700">
        We&apos;re working hard to improve our website and will be back soon.
      </p>
      <p className="mt-2 text-gray-500">Thank you for your patience!</p>
    </div>
  );
}
