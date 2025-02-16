import Navbar from "../ui/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm shadow-sm">
        <Navbar />
      </nav>
      <main className="pt-24">
        {children}
      </main>
    </div>
  );
} 