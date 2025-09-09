import React from 'react';
import NotificationHistory from '../components/NotificationHistory';
import NotificationBell from '../components/NotificationBell';
import { useNotifications } from '../hooks/useNotifications';

const App = () => {
  const userId = 1; // Get this from your auth context/state

  return (
    <div className="App">
      {/* Header with Notification Bell */}
      <header className="bg-white shadow-md p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <h1 className="text-xl font-bold">Inventory Management</h1>
          
          {/* Notification Bell in Header */}
          <NotificationBell userId={userId} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {/* Full Notification History Page */}
        <NotificationHistory userId={userId} />
      </main>
    </div>
  );
};

export default App;
