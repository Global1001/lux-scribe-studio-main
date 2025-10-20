import React, { useEffect, useState } from 'react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-center mb-8">
          Deep Legal Research Platform
        </h1>
        <p className="text-center text-lg mb-4">
          AI-powered legal research with streaming results and citation expansion
        </p>
        <div className="text-center mb-8">
          <p className="text-sm text-gray-600">
            🚧 Under Development - Goal 1 Skeleton Complete 🚧
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Next: Goal 2 - Core retrieval loop (CourtListener & CAP integration)
          </p>
        </div>
        <div className="w-full mt-8">
          <h2 className="text-2xl font-semibold mb-4">How to Use Research Mode</h2>
          <div className="bg-gray-100 rounded p-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Open the AI Chat panel (Ctrl+Alt+B)</li>
              <li>Click the "Tools" dropdown and select "External Research"</li>
              <li>Enter a legal research query (e.g., "Roe v Wade", "Miranda rights", "Brown v Board")</li>
              <li>Press Enter to search</li>
              <li>Results will be saved as a document in your Research folder</li>
            </ol>
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-800">
                <strong>Try these queries:</strong> "Roe v Wade", "Miranda", "Brown v Board", "410 U.S. 113"
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 