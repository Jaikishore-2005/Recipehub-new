import React, { useState, useEffect } from 'react';
import config from '../config';

const TestApiConnection: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        setStatus('Testing API connection...');
        console.log('Testing connection to:', `${config.API_URL}/api/test`);
        
        const response = await fetch(`${config.API_URL}/api/test`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          mode: 'cors'
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('API test failed:', response.status, errorData);
          setStatus(`Failed: ${response.status} ${response.statusText}`);
          setError(errorData);
          return;
        }
        
        const data = await response.json();
        console.log('API test result:', data);
        setStatus(`Connected! ${data.message}`);
        setError(null);
      } catch (error) {
        console.error('API connection error:', error);
        setStatus('Connection failed');
        setError(error instanceof Error ? error.message : String(error));
      }
    };

    testConnection();
  }, []);

  return (
    <div className="mt-4 p-4 border rounded bg-background">
      <h3 className="text-xl font-medium mb-2">API Connection Test</h3>
      <div className={`text-sm ${error ? 'text-destructive' : 'text-primary'}`}>
        Status: {status}
      </div>
      {error && (
        <div className="mt-2 text-sm text-destructive">
          Error: {error}
        </div>
      )}
      <div className="mt-2 text-xs text-muted-foreground">
        URL: {config.API_URL}
      </div>
    </div>
  );
};

export default TestApiConnection; 