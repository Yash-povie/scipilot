const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const login = async (username: string, password: string) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
};

export const uploadPDF = async (file: File, token: string) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/documents/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
};

// We use fetch for SSE to support POST with JSON body. Standard EventSource only supports GET.
export const streamQuery = async (query: string, token: string, onMessage: (data: any) => void) => {
  const res = await fetch(`${BASE_URL}/query/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ query }),
  });
  
  if (!res.body) throw new Error("ReadableStream not yet supported in this browser.");
  
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");
    
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          onMessage(data);
        } catch (e) {
          console.error("Failed to parse stream JSON:", e);
        }
      }
    }
  }
};
