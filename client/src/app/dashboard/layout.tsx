import { CourseTree } from "@/components/course/CourseTree";
import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
    </div>
  );
}
