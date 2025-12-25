import React, { createContext, useState, useContext } from 'react';

const ViewContext = createContext();

export const ViewProvider = ({ children }) => {
  // Options: 'editor', 'visualizer', 'learn'
  const [activeTab, setActiveTab] = useState('editor');

  return (
    <ViewContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ViewContext.Provider>
  );
};

export const useView = () => useContext(ViewContext);