import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { RecipeProvider } from "./contexts/RecipeContext";
import { ProtectedRoute } from "./utils/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import MyRecipes from "./pages/MyRecipes";
import SharedWithMe from "./pages/SharedWithMe";
import PublicRecipes from "./pages/PublicRecipes";
import CreateEditRecipe from "./pages/CreateEditRecipe";
import ViewRecipe from "./pages/ViewRecipe";
import ShareRecipe from "./pages/ShareRecipe";
import Account from "./pages/Account";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import ChangePassword from "./pages/ChangePassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RecipeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
              <Route path="/signup" element={<MainLayout><Signup /></MainLayout>} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout><Home /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/my-recipes" element={
                <ProtectedRoute>
                  <MainLayout><MyRecipes /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/shared-with-me" element={
                <ProtectedRoute>
                  <MainLayout><SharedWithMe /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/public-recipes" element={
                <ProtectedRoute>
                  <MainLayout><PublicRecipes /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/create-recipe" element={
                <ProtectedRoute>
                  <MainLayout><CreateEditRecipe /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/recipes/:recipeId" element={
                <ProtectedRoute>
                  <MainLayout><ViewRecipe /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/recipes/:recipeId/edit" element={
                <ProtectedRoute>
                  <MainLayout><CreateEditRecipe /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/recipes/:recipeId/share" element={
                <ProtectedRoute>
                  <MainLayout><ShareRecipe /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/account" element={
                <ProtectedRoute>
                  <MainLayout><Account /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/change-password" element={
                <ProtectedRoute>
                  <MainLayout><ChangePassword /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RecipeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
