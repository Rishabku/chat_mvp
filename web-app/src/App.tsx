import React from 'react';
import ChatWindow from './components/ChatWindow';
import './styles.css';

const App: React.FC = () => {
  // In a real app, you'd have routing to separate these
  const isAgent = window.location.pathname.includes('/agent');
console.log(isAgent);
  return (
    <div className="App">
      {isAgent ? <ChatWindow userType="agent" /> : <ChatWindow userType="user" />}
    </div>
  );
};

export default App;