import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "./components/AuthProvider";
import { RoleProtectedRoute } from "./components/RoleProtectedRoute";
import Index from "./pages/Index";
import Learn from "./pages/Learn";
import Games from "./pages/Games";
import Challenges from "./pages/Challenges";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import TeacherSignup from "./pages/TeacherSignup";
import StudentJoin from "./pages/StudentJoin";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import SchoolsRegister from "./pages/SchoolsRegister";
import SchoolDashboard from "./pages/SchoolDashboard";
import SchoolAdminDashboard from "./pages/SchoolAdminDashboard";
import TeacherInvite from "./pages/TeacherInvite";
import NotFound from "./pages/NotFound";
import StaggeredMenu from "./components/ui/StaggeredMenu";
import { menuItems, socialItems } from "./components/ui/MenuData";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <StaggeredMenu
            position="right"
            items={menuItems}
            socialItems={socialItems}
            displaySocials={true}
            displayItemNumbering={true}
            menuButtonColor="#0A0E09"
            openMenuButtonColor="#0A0E09"
            changeMenuColorOnOpen={true}
            colors={["#B19EEF", "#5227FF"]}
            logoUrl="/eco-quest-logo.png"
            accentColor="#ff6b6b"
          />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/games" element={<Games />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/teachers/signup" element={<TeacherSignup />} />
            <Route path="/schools/register" element={<ProtectedRoute><SchoolsRegister /></ProtectedRoute>} />
            <Route path="/schools/dashboard" element={<ProtectedRoute><SchoolDashboard /></ProtectedRoute>} />
            <Route path="/schools/admin-dashboard" element={<RoleProtectedRoute allowedRoles={['school_admin']}><SchoolAdminDashboard /></RoleProtectedRoute>} />
            <Route path="/teachers/invite/:token" element={<TeacherInvite />} />
            <Route path="/join/:class_code?" element={<StudentJoin />} />
            <Route path="/teacher/dashboard" element={<RoleProtectedRoute allowedRoles={['teacher', 'school_admin']}><TeacherDashboard /></RoleProtectedRoute>} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
