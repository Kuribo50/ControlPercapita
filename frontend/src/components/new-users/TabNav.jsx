// src/components/new-users/TabNav.jsx
import React from 'react';

export default function TabNav({ tabs, activeTab, onChange }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm mb-6">
      <nav className="flex space-x-8 px-6 py-3" aria-label="Tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative pb-2 font-medium text-sm transition ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-1">
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.name}</span>
              {tab.badge && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1">{tab.description}</div>
          </button>
        ))}
      </nav>
    </div>
  );
}
