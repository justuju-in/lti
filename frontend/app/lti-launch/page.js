"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Home from '../page';

function LtiLaunchContent() {
  const [ltiData, setLtiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const transferId = searchParams.get('transferId');
    
    if (transferId) {
      // Fetch LTI data from backend
      const backendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://lti.csbasics.in' 
        : 'http://localhost:3000'
      
      fetch(`${backendUrl}/api/session-transfer/${transferId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch LTI session data');
          }
          return res.json();
        })
        .then(data => {
          setLtiData(data);
          
          // Store in frontend session
          fetch('/api/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
          });
          
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching LTI data:', err);
          setError(err.message);
          setLoading(false);
        });
    } else {
      setError('No transfer ID provided');
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Loading LTI Application...</h2>
        <p>Authenticating with Moodle...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: 'red' }}>
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <p>Please try launching the application again from Moodle.</p>
      </div>
    );
  }

  return (
    <div>
      {ltiData && (
        <div style={{ 
          padding: 10, 
          backgroundColor: '#f8f9fa', 
          borderBottom: '1px solid #dee2e6',
          marginBottom: 20 
        }}>
          <h4>Welcome, {ltiData.userInfo.name}!</h4>
          {ltiData.contextInfo && <p>Course: {ltiData.contextInfo.title}</p>}
          {ltiData.resourceInfo && <p>Activity: {ltiData.resourceInfo.title}</p>}
        </div>
      )}
      <Home />
    </div>
  );
}

export default function LtiLaunch() {
  return (
    <Suspense fallback={
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    }>
      <LtiLaunchContent />
    </Suspense>
  );
}
