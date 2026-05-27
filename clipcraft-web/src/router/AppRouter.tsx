import { AnimatePresence, motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AnalyzingScreen from '../pages/AnalyzingScreen';
import AuthScreen from '../pages/AuthScreen';
import EditorScreen from '../pages/EditorScreen';
import ProjectsScreen from '../pages/ProjectsScreen';
import UploadScreen from '../pages/UploadScreen';
import { pageTransition } from '../lib/animations';
import type { HighlightAnalysisResult, PendingHighlightAnalysis } from '../types/app';

function UploadRoute() {
  const navigate = useNavigate();
  return <UploadScreen onNext={(result) => navigate('/analyzing', { state: result })} />;
}

function AnalyzingRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const pendingAnalysis = location.state as PendingHighlightAnalysis | null;

  if (!pendingAnalysis?.file || !pendingAnalysis.scenarios?.length) return <Navigate to="/" replace />;

  return <AnalyzingScreen request={pendingAnalysis} onDone={(result) => navigate('/editor', { state: result })} onBack={() => navigate('/')} />;
}

function EditorRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const analysisResult = location.state as HighlightAnalysisResult | null;

  if (!analysisResult?.segments?.length) return <Navigate to="/" replace />;

  return (
    <EditorScreen
      analysis={analysisResult}
      projectName={analysisResult.projectName}
      videoName={analysisResult.videoName}
      videoUrl={analysisResult.videoUrl}
      onBack={() => navigate('/')}
    />
  );
}

function AuthRoute() {
  const navigate = useNavigate();
  return <AuthScreen onContinue={() => navigate('/projects')} />;
}

function ProjectsRoute() {
  const navigate = useNavigate();
  return <ProjectsScreen onStartNewProject={() => navigate('/')} />;
}

export default function AppRouter() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
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
          path="/projects"
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
