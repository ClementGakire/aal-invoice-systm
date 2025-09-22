import { useState } from 'react';

interface ApiExplorerProps {
  endpoint?: string;
}

// Predefined API endpoints for quick testing
const PREDEFINED_ENDPOINTS = [
  { label: 'Clients API', url: 'http://localhost:3000/api/clients' },
  {
    label: 'Base64 Text Test',
    url: 'http://localhost:3000/api/base64test/text',
  },
  {
    label: 'Base64 Image Test',
    url: 'http://localhost:3000/api/base64test/image',
  },
  { label: 'Direct Clients API (Vite)', url: '/api/clients' },
  { label: 'Vercel API Check', url: 'http://localhost:3000/api' },
];

export default function ApiExplorer({
  endpoint = '/api/clients',
}: ApiExplorerProps) {
  const [url, setUrl] = useState<string>(endpoint);
  const [method, setMethod] = useState<string>('GET');
  const [body, setBody] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [mode, setMode] = useState<'raw' | 'parsed'>('parsed');
  const [format, setFormat] = useState<'text' | 'json' | 'base64'>('json');
  const [showPredefined, setShowPredefined] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    setResult('Loading...');

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method !== 'GET' && method !== 'HEAD' && body) {
        options.body = body;
      }

      const response = await fetch(url, options);
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      // Get the raw text response
      const text = await response.text();

      // Try to parse as JSON
      let parsedData: any = null;
      let isBase64 = false;

      try {
        parsedData = JSON.parse(text);
      } catch (e) {
        // Check if base64 encoded
        try {
          const decoded = atob(text);
          try {
            parsedData = JSON.parse(decoded);
            isBase64 = true;
          } catch (e2) {
            // Not valid JSON after base64 decode
          }
        } catch (e3) {
          // Not valid base64
        }
      }

      let resultOutput = '';
      if (mode === 'raw') {
        resultOutput = text;
      } else {
        if (parsedData) {
          resultOutput = JSON.stringify(parsedData, null, 2);
        } else if (isBase64) {
          resultOutput = `Base64 encoded data: ${text.substring(0, 100)}...`;
        } else {
          resultOutput = text;
        }
      }

      setResult(`
Status: ${response.status} ${response.statusText}
Content-Type: ${contentType || 'unknown'}
Format: ${isJson ? 'JSON' : isBase64 ? 'Base64 encoded JSON' : 'Text/Unknown'}
Data:
${resultOutput}
      `);
    } catch (error) {
      setResult(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h2 className="text-lg font-semibold mb-4">API Explorer</h2>

      <div className="flex gap-2 mb-2">
        <select
          className="px-3 py-1 border rounded"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>

        <input
          type="text"
          className="flex-1 px-3 py-1 border rounded"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="API endpoint URL"
        />

        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          onClick={fetchData}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Send'}
        </button>

        <button
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          onClick={() => setShowPredefined(!showPredefined)}
        >
          {showPredefined ? 'Hide Presets' : 'Show Presets'}
        </button>
      </div>

      {showPredefined && (
        <div className="mb-4 p-2 bg-gray-100 rounded border border-gray-200">
          <h3 className="text-sm font-medium mb-2">API Endpoint Presets:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {PREDEFINED_ENDPOINTS.map((endpoint, index) => (
              <button
                key={index}
                className="px-2 py-1 text-left text-sm bg-white border border-gray-300 rounded hover:bg-blue-50"
                onClick={() => {
                  setUrl(endpoint.url);
                  setMethod('GET');
                }}
              >
                <div className="font-medium">{endpoint.label}</div>
                <div className="text-xs text-gray-500 truncate">
                  {endpoint.url}
                </div>
              </button>
            ))}
            <button
              className="px-2 py-1 text-left text-sm bg-yellow-50 border border-yellow-300 rounded hover:bg-yellow-100"
              onClick={() => {
                setUrl('http://localhost:3000/api/debug-server');
                setMethod('GET');
              }}
            >
              <div className="font-medium">🔍 Debug API Server</div>
              <div className="text-xs text-gray-500">
                Check server configuration
              </div>
            </button>
          </div>
        </div>
      )}

      {(method === 'POST' || method === 'PUT') && (
        <div className="mb-4">
          <textarea
            className="w-full h-20 p-2 border rounded font-mono text-sm"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Request body (JSON)"
          />
        </div>
      )}

      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="mode"
              checked={mode === 'parsed'}
              onChange={() => setMode('parsed')}
              className="mr-1"
            />
            Parsed
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="mode"
              checked={mode === 'raw'}
              onChange={() => setMode('raw')}
              className="mr-1"
            />
            Raw
          </label>
        </div>

        <div className="flex gap-2">
          <button
            className={`px-2 py-1 text-xs rounded ${
              format === 'json' ? 'bg-blue-200' : 'bg-gray-200'
            }`}
            onClick={() => setFormat('json')}
          >
            JSON
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${
              format === 'text' ? 'bg-blue-200' : 'bg-gray-200'
            }`}
            onClick={() => setFormat('text')}
          >
            Text
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${
              format === 'base64' ? 'bg-blue-200' : 'bg-gray-200'
            }`}
            onClick={() => setFormat('base64')}
          >
            Base64
          </button>
        </div>
      </div>

      <div className="p-3 bg-black text-green-400 font-mono text-sm rounded-md min-h-40 max-h-96 overflow-auto whitespace-pre-wrap">
        {result || 'Click "Send" to make an API request'}
      </div>
    </div>
  );
}
