import Image from 'next/image';
import Link from 'next/link';

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
      <div className="space-y-4 max-w-2xl">
        <p className="text-lg text-gray-600">
          Several system features have been temporarily disabled as we implement a new backend API. 
          We are working diligently to develop more intuitive and powerful tools that will enhance your experience.
        </p>
        <p className="text-lg text-gray-600">
          Your feedback is valuable to us! Join our WhatsApp discussion group to share which features you miss the most 
          and help shape our development priorities.
        </p>
      </div>
      <Link 
        href="/admin/changelog#changelog-2025-01-27" 
        className="text-blue-600 hover:text-blue-800 mt-6 mb-8 underline"
      >
        See details in our changelog
      </Link>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Our team is actively developing this feature</span>
      </div>
    </div>
  );
}
