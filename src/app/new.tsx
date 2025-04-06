'use client'

import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateArticle() {
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const router = useRouter()
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      
      try {
        const response = await fetch('/api/newarticle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: title }),
        });
        console.log('resp', response)
        if (!response.ok) throw new Error('Failed to create article');
        const id = await response.text();
        
        await router.push(`/article/${id}`)
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Create your article"
              className="w-full px-4 py-3 pr-32 text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`absolute right-2 top-1/2 -translate-y-1/2 py-2 px-3 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out transform hover:scale-[1.02] ${
                isLoading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create'
              )}
            </button>
          </div>
  
          {showSuccess && (
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-up">
              Article created successfully!
            </div>
          )}
        </form>
      </div>
    );
  }