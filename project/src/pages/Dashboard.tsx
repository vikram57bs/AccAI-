import React, { useState } from 'react';
import {
  Brain,
  GitCompare as Compare,
  BarChart3,
  Settings,
  Send,
  Copy,
  LogOut
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ModelOutput {
  model: string;
  content: string;
  metrics: {
    timeToGenerate: string;
    tokenCount: number;
    confidence: number;
  };
}

function Dashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const currentUserEmail = user?.email || null;

  const [prompt, setPrompt] = useState('');
  const [outputs, setOutputs] = useState<ModelOutput[]>([
    {
      model: 'Cohere',
      content: '',
      metrics: { timeToGenerate: '0.0s', tokenCount: 0, confidence: 0 }
    },
    {
      model: 'Gemini Pro',
      content: '',
      metrics: { timeToGenerate: '0.0s', tokenCount: 0, confidence: 0 }
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let claudeOutput = outputs.find((o) => o.model === 'Cohere')!;
    let geminiOutput = outputs.find((o) => o.model === 'Gemini Pro')!;

    try {
      const claudeRes = await fetch('http://localhost:5000/api/cohere', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (claudeRes.ok) {
        const data = await claudeRes.json();
        claudeOutput = {
          model: 'Cohere',
          content: data.content,
          metrics: {
            timeToGenerate: (data.timeTakenMs / 1000).toFixed(2) + 's',
            tokenCount: data.totalTokens === 'N/A' ? 0 : Number(data.totalTokens),
            confidence: parseFloat(data.confidenceLevel) || 0
          }
        };
      } else {
        console.error('Cohere API error:', claudeRes.statusText);
      }
    } catch (err) {
      console.error('Error fetching Cohere output:', err);
    }

    try {
      const geminiRes = await fetch('http://localhost:5000/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        geminiOutput = {
          model: 'Gemini Pro',
          content: data.content,
          metrics: {
            timeToGenerate: (data.timeTakenMs / 1000).toFixed(2) + 's',
            tokenCount: data.totalTokens === 'N/A' ? 0 : Number(data.totalTokens),
            confidence: parseFloat(data.confidenceLevel) || 0
          }
        };
      } else {
        console.error('Gemini API error:', geminiRes.statusText);
      }
    } catch (err) {
      console.error('Error fetching Gemini output:', err);
    }

    setOutputs([claudeOutput, geminiOutput]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compare className="h-8 w-8 text-blue-500" />
              <h1 className="text-2xl font-bold">AccAI</h1>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-gray-400">Welcome, {user?.email}</span>
              <nav className="flex items-center space-x-4">
                <button className="p-2 hover:bg-gray-700 rounded-lg transition">
                  <BarChart3 className="h-5 w-5" />
                </button>
                <button
                  className="p-2 hover:bg-gray-700 rounded-lg transition"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-5 w-5" />
                </button>
                <button
                  onClick={logout}
                  className="p-2 hover:bg-gray-700 rounded-lg transition text-red-400"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              className="w-full h-32 bg-gray-800 rounded-lg p-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Generate</span>
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {outputs.map((output, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">{output.model}</h3>
                </div>
                <button
                  onClick={() => copyToClipboard(output.content)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>

              <div className="h-64 overflow-y-auto bg-gray-900 rounded-lg p-4 mb-4">
                <ReactMarkdown className="prose prose-invert">
                  {output.content || 'Output will appear here...'}
                </ReactMarkdown>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-900 p-2 rounded-lg">
                  <div className="text-gray-400">Time</div>
                  <div>{output.metrics.timeToGenerate}</div>
                </div>
                
                <div className="bg-gray-900 p-2 rounded-lg">
                  <div className="text-gray-400">Confidence</div>
                  <div>
                    {!isNaN(output.metrics.confidence)
                      ? `${output.metrics.confidence.toFixed(1)}%`
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
