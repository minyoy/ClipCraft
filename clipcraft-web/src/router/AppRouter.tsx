import { AnimatePresence, motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AnalyzingScreen from '@/pages/AnalyzingScreen';
import AuthScreen from '@/pages/AuthScreen';
import EditorScreen from '@/pages/EditorScreen';
import LandingScreen from '@/pages/LandingScreen';
import ProjectsScreen from '@/pages/ProjectsScreen';
import UploadScreen from '@/pages/UploadScreen';
import { pageTransition } from '@/lib/animations';
import type { HighlightAnalysisResult, PendingHighlightAnalysis } from '@/types/app';

function UploadRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as { format?: string; projectName?: string } | null;

  return (
    <UploadScreen
      initialProjectFormat={routeState?.format}
      initialProjectName={routeState?.projectName}
      onLogoClick={() => navigate('/')}
      onNext={(result) => navigate('/analyzing', { state: result })}
    />
  );
}

function AnalyzingRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const pendingAnalysis = location.state as PendingHighlightAnalysis | null;

  if (!pendingAnalysis?.file || !pendingAnalysis.scenarios?.length) return <Navigate to="/upload" replace />;

  return <AnalyzingScreen request={pendingAnalysis} onDone={(result) => navigate('/editor/mock-job', { state: result })} onBack={() => navigate('/upload')} />;
}

function EditorRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const analysisResult = location.state as HighlightAnalysisResult | null;

  if (!analysisResult?.segments?.length) return <Navigate to="/upload" replace />;

  return (
    <EditorScreen
      analysis={analysisResult}
      projectName={analysisResult?.projectName}
      videoPath={analysisResult?.videoPath}
      videoName={analysisResult?.videoName}
      videoUrl={analysisResult?.videoUrl}
      onBack={() => navigate('/upload')}
    />
  );
}

function AuthRoute() {
  const navigate = useNavigate();
  return <AuthScreen onContinue={() => navigate('/workspace')} onLogoClick={() => navigate('/')} />;
}

function ProjectsRoute() {
  const navigate = useNavigate();
  return <ProjectsScreen onLogoClick={() => navigate('/')} onStartNewProject={(project) => navigate('/upload', { state: project })} />;
}

export default function AppRouter() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              className="min-h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <LandingScreen />
            </motion.div>
          }
        />
        <Route
          path="/upload"
          element={
            <motion.div className="min-h-screen" initial="hidden" animate="visible" exit="exit" variants={pageTransition}>
              <UploadRoute />
            </motion.div>
          }
        />
        <Route
          path="/analyzing"
          element={
            <motion.div
              className="min-h-screen"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <AnalyzingRoute />
            </motion.div>
          }
        />
        <Route
          path="/editor"
          element={
            <motion.div
              className="min-h-screen"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <EditorRoute />
            </motion.div>
          }
        />
        <Route
          path="/editor/:jobId"
          element={
            <motion.div
              className="min-h-screen"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <EditorRoute />
            </motion.div>
          }
        />
        <Route
          path="/auth"
          element={
            <motion.div
              className="min-h-screen"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <AuthRoute />
            </motion.div>
          }
        />
        <Route
          path="/login"
          element={
            <motion.div
              className="min-h-screen"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <AuthRoute />
            </motion.div>
          }
        />
        <Route
          path="/workspace"
          element={
            <motion.div
              className="min-h-screen"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <ProjectsRoute />
            </motion.div>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
