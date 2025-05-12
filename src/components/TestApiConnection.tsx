import React, { useState } from 'react';
import config from '../config';

const TestApiConnection = () => {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('password123');
  const [testName, setTestName] = useState('Test User');

  const checkApi = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/api`);
      const data = await response.json();
      setResult({
        status: response.status,
        data
      });
    } catch (err) {
      setResult({
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testSignup = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: testName,
          email: testEmail,
          password: testPassword
        })
      });
      
      const data = await response.json();
      setResult({
        status: response.status,
        data
      });
    } catch (err) {
      setResult({
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        })
      });
      
      const data = await response.json();
      setResult({
        status: response.status,
        data
      });
    } catch (err) {
      setResult({
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">API Connection Tester</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">API URL:</label>
          <input 
            type="text" 
            value={config.API_URL} 
            readOnly 
            className="w-full p-2 border rounded bg-gray-50"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Test Name:</label>
          <input 
            type="text" 
            value={testName} 
            onChange={(e) => setTestName(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Test Email:</label>
          <input 
            type="email" 
            value={testEmail} 
            onChange={(e) => setTestEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Test Password:</label>
          <input 
            type="text" 
            value={testPassword} 
            onChange={(e) => setTestPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={checkApi}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test API Connection
        </button>
        <button
          onClick={testSignup}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Signup
        </button>
        <button
          onClick={testLogin}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Login
        </button>
      </div>
      
      {isLoading && <p className="text-gray-600">Loading...</p>}
      
      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Result:</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestApiConnection; 