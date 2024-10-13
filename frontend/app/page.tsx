import GoogleAuthButton from "@/components/GoogleAuthButton";
import GrayedBackgroundMap from "@/components/GrayedBackgroundMap";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen bg-white">
      <main className="flex-1 flex flex-col items-center justify-center relative">
        <GoogleAuthButton />
        <div className="absolute inset-0 -z-10">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-50 backdrop-filter backdrop-blur-sm" />
          </div>
        </div>
      </main>
    </div>
  );
}
