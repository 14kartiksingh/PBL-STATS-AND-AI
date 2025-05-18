import React, { useState } from 'react';
import axios from 'axios';


// Styled components
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f5f7fb',
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '2rem',
    fontSize: '2.5rem',
    fontWeight: '600',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
  },
  uploadSection: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem'
  },
  inputGroup: {
    marginBottom: '1.5rem'
  },
  fileInput: {
    display: 'none'
  },
  fileLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#4a90e2',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: '#357abd',
      transform: 'translateY(-2px)'
    }
  },
  questionInput: {
    width: '100%',
    padding: '1rem',
    border: '2px solid #e0e7ff',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    ':focus': {
      outline: 'none',
      borderColor: '#4a90e2',
      boxShadow: '0 0 0 3px rgba(74, 144, 226, 0.2)'
    }
  },
  uploadButton: {
    width: '100%',
    padding: '1rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  responseSection: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    marginTop: '2rem'
  },
  sectionTitle: {
    color: '#2c3e50',
    marginBottom: '1rem',
    fontSize: '1.4rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  extractedText: {
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '8px',
    lineHeight: '1.6',
    color: '#4a5568',
    whiteSpace: 'pre-wrap'
  },
  aiResponse: {
    backgroundColor: '#fff9f0',
    padding: '1.5rem',
    borderRadius: '8px',
    lineHeight: '1.6',
    color: '#4a5568',
    whiteSpace: 'pre-wrap',
    borderLeft: '4px solid rgb(123, 246, 85)'
  },
  loadingSpinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #4a90e2',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    animation: 'spin 1s linear infinite'
  }
};

function App() {
    const [file, setFile] = useState(null);
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleQuestionChange = (e) => {
        setQuestion(e.target.value);
    };

    const checkAnswerCorrectness = (aiResponse) => {
      const lowerResponse = aiResponse.toLowerCase();
      if (lowerResponse.includes('yes')) return true;
      if (lowerResponse.includes('no')) return false;
      return null; // for uncertain cases
    };

    const handleUpload = async () => {
        if (!file || !question) {
            alert('Please upload a file and enter a question.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('question', question);

        try {
            const res = await axios.post('http://localhost:5000/upload', formData);
            setResponse(res.data);
        } catch (error) {
            alert(`Upload failed: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>📚 AI Answer Checker</h1>
            
            <div style={styles.uploadSection}>
                <div style={styles.inputGroup}>
                    <input 
                        type="file" 
                        onChange={handleFileChange}
                        id="fileInput"
                        style={styles.fileInput}
                    />
                    <label 
                        htmlFor="fileInput"
                        style={styles.fileLabel}
                    >
                        📁 {file ? file.name : 'Choose Answer Sheet'}
                    </label>
                </div>

                <div style={styles.inputGroup}>
                    <input
                        type="text"
                        placeholder="✏️ Enter Question..."
                        value={question}
                        onChange={handleQuestionChange}
                        style={styles.questionInput}
                    />
                </div>

                <button 
                    onClick={handleUpload}
                    disabled={loading}
                    style={{
                        ...styles.uploadButton,
                        backgroundColor: loading ? '#cbd5e0' : '#4a90e2',
                        color: loading ? '#718096' : 'white',
                        ':hover': !loading && {
                            backgroundColor: '#357abd',
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    {loading ? (
                        <div style={styles.loadingSpinner}></div>
                    ) : (
                        '🚀 Upload & Analyze'
                    )}
                </button>
            </div>
            
            {response && (
                <div style={styles.responseSection}>
                    <h3 style={styles.sectionTitle}>
                        <span>📄 Extracted Text:</span>
                    </h3>
                    <div style={styles.extractedText}>
                        {response.extracted_text}
                    </div>

                    <h3 style={styles.sectionTitle}>
                        <span>🤖 AI Analysis:</span>
                    </h3>
                    <div style={styles.aiResponse}>
                        {response.ai_response}
                    </div>
                </div>
            )}

            {/* Add CSS animations */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default App;