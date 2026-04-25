import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BaseLayout from '../shared/ui/BaseLayout/BaseLayout';
import { ChatBotButton, ChatWindow } from '../widgets/ChatBot';
import { 
  HomePage, 
  ContactsPage, 
  NotFoundPage, 
  Excursions, 
  HallPage, 
  ArtifactPage, 
  ArtifactDetailPage,
  FeedbackPage,
  HistoricalFiguresPage,
  HistoricalFigureDetailPage
} from '../pages';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  return (
    <>
      <BaseLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/excursions" element={<Excursions />} />
          <Route path="/historical_figures" element={<HistoricalFiguresPage />} />
          <Route path="/historical_figures/:id" element={<HistoricalFigureDetailPage />} />
          <Route path="/halls" element={<HallPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/survey" element={<FeedbackPage />} />
          <Route path="/artifacts" element={<ArtifactPage />} />
          <Route path="/artifact/:id" element={<ArtifactDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BaseLayout>
      <ChatBotButton onClick={toggleChat} isOpen={isChatOpen} />
      <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}

export default App;
