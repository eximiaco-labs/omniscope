import Image from 'next/image';

export default function UnderConstruction() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 mb-8 relative">
        <Image
          src="/construction.svg"
          alt="Under Construction"
          width={96}
          height={96}
          className="animate-bounce"
        />
      </div>
      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        Under Construction
      </h1>
      <p className="text-lg text-gray-600 max-w-md mb-8">
        We are working hard to bring you something amazing. This section will be available soon.
      </p>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Our team is actively developing this feature</span>
      </div>
    </div>
  );
}
