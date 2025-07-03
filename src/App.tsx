
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/StudentDashboard";
import StudentCourses from "./pages/StudentCourses";
import TeacherDashboard from "./pages/TeacherDashboard";
import CourseDetail from "./pages/CourseDetail";
import CourseQuiz from "./pages/CourseQuiz";
import NotFound from "./pages/NotFound";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import AvatarStore from "./pages/AvatarStore";
import Farm from "./pages/Farm";
import Analytics from "./pages/Analytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route 
                path="/auth" 
                element={
                  <AuthGuard requireAuth={false}>
                    <Auth />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <AuthGuard requireAuth={true}>
                    <StudentDashboard />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/teacher-dashboard" 
                element={
                  <AuthGuard requireAuth={true}>
                    <TeacherDashboard />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/course/:courseId" 
                element={
                  <AuthGuard requireAuth={true}>
                    <CourseDetail />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/course/:courseId/quiz" 
                element={
                  <AuthGuard requireAuth={true} allowedRoles={['student']}>
                    <CourseQuiz />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/courses" 
                element={
                  <AuthGuard requireAuth={true} allowedRoles={['student']}>
                    <StudentCourses />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/leaderboard" 
                element={
                  <AuthGuard requireAuth={true} allowedRoles={['student']}>
                    <Leaderboard />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <AuthGuard requireAuth={true}>
                    <Profile />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/avatar-store" 
                element={
                  <AuthGuard requireAuth={true} allowedRoles={['student']}>
                    <AvatarStore />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/farm" 
                element={
                  <AuthGuard requireAuth={true} allowedRoles={['student']}>
                    <Farm />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <AuthGuard requireAuth={true} allowedRoles={['teacher']}>
                    <Analytics />
                  </AuthGuard>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
