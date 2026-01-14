import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Play, CheckCircle, XCircle } from 'lucide-react';

export default function CodePlayground({ playground }) {
  const [code, setCode] = useState(playground?.starter_code || '');
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState([]);

  const runCode = () => {
    try {
      // In a real implementation, this would run in a sandboxed environment
      const result = eval(code);
      setOutput(String(result));
      
      // Check test cases
      const results = playground.test_cases?.map(test => ({
        ...test,
        passed: String(result) === test.expected_output
      }));
      setTestResults(results);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Code Playground - {playground?.language}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="font-mono text-sm min-h-48"
          placeholder="Write your code here..."
        />
        <Button onClick={runCode} className="w-full">
          <Play className="w-4 h-4 mr-2" />
          Run Code
        </Button>
        {output && (
          <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <div className="text-slate-400 mb-2">Output:</div>
            {output}
          </div>
        )}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Results:</h4>
            {testResults.map((test, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-sm">
                {test.passed ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span>{test.description}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}