import { useState } from 'react';
import {
  api,
  testApiConnection,
  forceRealApi,
  isUsingFallback,
  resetApiAvailability,
} from '../services/api';

export default function ApiDebugger() {
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [base64Input, setBase64Input] = useState<string>('');
  const [base64Output, setBase64Output] = useState<string>('');

  // Function to test API connection
  const testConnection = async () => {
    setLoading(true);
    setOutput('Testing API connection...');
    try {
      const result = await testApiConnection();
      setOutput(
        `API connection test: ${
          result ? 'SUCCESS' : 'FAILED'
        }\nUsing fallback: ${isUsingFallback()}`
      );
    } catch (error) {
      setOutput(
        `Error testing API: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to test fetching clients
  const fetchClients = async () => {
    setLoading(true);
    setOutput('Fetching clients...');
    try {
      const result = await api.clients.getAll();
      setOutput(
        `Fetched ${result.total} clients:\n${JSON.stringify(result, null, 2)}`
      );
    } catch (error) {
      setOutput(
        `Error fetching clients: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to reset API availability
  const resetApi = () => {
    resetApiAvailability();
    setOutput('API availability reset. Now trying auto-detect mode.');
    forceRealApi(false);
  };

  // Function to force real API
  const forceApi = () => {
    forceRealApi(true);
    setOutput(
      'Forced real API mode enabled. Will ignore API availability checks.'
    );
  };

  // Function to check API server configuration
  const checkApiConfig = async () => {
    setLoading(true);
    setOutput('Checking API server configuration...');
    try {
      // Make a direct fetch to the API endpoint
      const response = await fetch(`http://localhost:3000/api/clients`);
      const status = `Status: ${response.status} ${response.statusText}`;
      const contentType = `Content-Type: ${
        response.headers.get('content-type') || 'none'
      }`;

      const text = await response.text();

      // Check if the response looks like source code instead of executed API
      const isSourceCode =
        text.includes('import {') ||
        text.includes('export default') ||
        text.match(/function\s+handler\(/);

      if (isSourceCode) {
        setOutput(
          `❌ API SERVER CONFIGURATION ERROR!\n\n` +
            `${status}\n${contentType}\n\n` +
            `The API is returning its source code instead of executing it.\n` +
            `This indicates that the Vercel development server is not properly handling API routes.\n\n` +
            `TROUBLESHOOTING STEPS:\n` +
            `1. Make sure you're running 'vercel dev' and not just 'vite'\n` +
            `2. Check that your 'api' directory is correctly set up\n` +
            `3. Restart the Vercel dev server\n` +
            `4. Check for any errors in the terminal\n\n` +
            `Response preview:\n${text.substring(0, 300)}...`
        );
      } else {
        setOutput(
          `API Configuration Check:\n\n` +
            `${status}\n${contentType}\n\n` +
            `Response preview (first 300 chars):\n${text.substring(0, 300)}...`
        );
      }
    } catch (error) {
      setOutput(
        `Error checking API configuration: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to test base64 text endpoint

  // Function to test base64 text endpoint
  const testBase64Text = async () => {
    setLoading(true);
    setOutput('Testing base64 text endpoint...');
    try {
      const result = await api.base64test.getText();
      setOutput(`Base64 Text Result:\n${JSON.stringify(result, null, 2)}`);

      if (result.base64Data) {
        try {
          // Try to decode
          const decoded = atob(result.base64Data);
          setBase64Output(`Decoded (client-side): ${decoded}`);
        } catch (e) {
          setBase64Output(`Failed to decode. Not a valid base64 string: ${e}`);
        }
      }
    } catch (error) {
      setOutput(
        `Error testing base64 text: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to test base64 image endpoint
  const testBase64Image = async () => {
    setLoading(true);
    setOutput('Testing base64 image endpoint...');
    try {
      const result = await api.base64test.getImage();
      setOutput(
        `Base64 Image Result (first 100 chars):\n${JSON.stringify(
          {
            base64Data: result.base64Data
              ? result.base64Data.substring(0, 100) + '...'
              : 'none',
          },
          null,
          2
        )}`
      );

      if (result.base64Data) {
        setBase64Output(`
<img src="${result.base64Data}" alt="Base64 encoded image" style="max-width:100%; max-height:200px; border:1px solid #ccc;">
        `);
      }
    } catch (error) {
      setOutput(
        `Error testing base64 image: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to manually encode a string to base64
  const encodeBase64 = () => {
    try {
      const encoded = btoa(base64Input);
      setBase64Output(`Encoded: ${encoded}`);
    } catch (e) {
      setBase64Output(`Failed to encode: ${e}`);
    }
  };

  // Function to manually decode a base64 string
  const decodeBase64 = () => {
    try {
      const decoded = atob(base64Input);
      setBase64Output(`Decoded: ${decoded}`);
    } catch (e) {
      setBase64Output(`Failed to decode. Not a valid base64 string: ${e}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h2 className="text-lg font-semibold mb-4">API Debugger</h2>

      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">API Tests</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            onClick={testConnection}
            disabled={loading}
          >
            Test Connection
          </button>
          <button
            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300"
            onClick={fetchClients}
            disabled={loading}
          >
            Fetch Clients
          </button>
          <button
            className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:bg-yellow-300"
            onClick={resetApi}
            disabled={loading}
          >
            Reset API
          </button>
          <button
            className="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-purple-300"
            onClick={checkApiConfig}
            disabled={loading}
          >
            Check API Config
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300"
            onClick={forceApi}
            disabled={loading}
          >
            Force Real API
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">Base64 Testing</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className="px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:bg-indigo-300"
            onClick={testBase64Text}
            disabled={loading}
          >
            Test Base64 Text
          </button>
          <button
            className="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-purple-300"
            onClick={testBase64Image}
            disabled={loading}
          >
            Test Base64 Image
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          <input
            type="text"
            className="flex-1 px-3 py-1 border rounded"
            value={base64Input}
            onChange={(e) => setBase64Input(e.target.value)}
            placeholder="Enter text or base64 string"
          />
          <button
            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
            onClick={encodeBase64}
          >
            Encode
          </button>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={decodeBase64}
          >
            Decode
          </button>
        </div>

        {base64Output && (
          <div
            className="p-3 bg-gray-100 border border-gray-300 rounded-md overflow-auto max-h-40"
            dangerouslySetInnerHTML={{ __html: base64Output }}
          />
        )}
      </div>

      <div className="p-3 bg-black text-green-400 font-mono text-sm rounded-md min-h-40 max-h-96 overflow-auto whitespace-pre-wrap">
        {output || 'Click one of the buttons above to debug API functionality'}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        {isUsingFallback()
          ? '⚠️ Using mock data fallback'
          : '✅ Using real API'}
        {loading && ' • Loading...'}
      </div>
    </div>
  );
}
