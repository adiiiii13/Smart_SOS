import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini AI client
const API_KEY = 'AIzaSyCrPSFzP4SwTrM_hnnbEvCLvgTmD0GcOI8';

if (!API_KEY) {
  console.error('Gemini API key is missing. Please set the GEMINI_API_KEY environment variable.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Emergency-focused system prompt with Hinglish
const SYSTEM_PROMPT = `You are an Emergency Response AI Assistant for the SOS app. Your role is to:

1. Provide immediate guidance for emergency situations
2. Offer first aid advice when appropriate
3. Direct users to proper emergency services
4. Give safety tips and preventive measures
5. Help users stay calm during emergencies

IMPORTANT GUIDELINES:
- Always prioritize safety and direct users to call emergency services (100, 101, 102) for serious situations
- Provide clear, concise, and actionable advice
- Stay focused on emergency response and safety
- Be empathetic and reassuring
- If someone is in immediate danger, emphasize calling emergency services first
- For medical emergencies, provide basic first aid guidance but always recommend professional medical help

Emergency Services Numbers (India):
- Police: 100
- Fire: 101
- Ambulance: 102
- Women Helpline: 1091
- Child Helpline: 1098

RESPONSE STYLE:
- Use Hinglish (Hindi-English mix) - friendly and relatable
- Keep responses SHORT and CONCISE (max 2-3 sentences)
- Be warm and supportive like a friend
- Use simple words and avoid medical jargon
- Always include relevant emergency numbers
- Examples: "Bhai, ye situation serious hai. Ambulance ko call kar (102)"

Keep responses helpful, accurate, and focused on emergency assistance.`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class GeminiAIService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  private chatHistory: ChatMessage[] = [];

  constructor() {
    // Initialize with system prompt
    this.chatHistory.push({
      role: 'assistant',
      content: 'Namaste! 🙏 Main aapka Emergency Response AI Assistant hoon. Emergency situations mein help karne ke liye yahan hoon. Kya help chahiye aapko?'
    });
  }

  async sendMessage(userMessage: string): Promise<string> {
    try {
      console.log('🤖 Sending message to Gemini AI:', userMessage);
      
      // Add user message to history
      this.chatHistory.push({
        role: 'user',
        content: userMessage
      });

      // Create a prompt that includes the system instruction and user message
      const fullPrompt = `${SYSTEM_PROMPT}\n\nUser: ${userMessage}\n\nAssistant:`;

      console.log('💬 Generating content with prompt...');

      // Use generateContent instead of startChat for better compatibility
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });
      const response = await result.response;
      const responseText = response.text();

      console.log('✅ AI Response received:', responseText);

      // Add AI response to history
      this.chatHistory.push({
        role: 'assistant',
        content: responseText
      });

      // Keep only last 10 messages to prevent context overflow
      if (this.chatHistory.length > 10) {
        this.chatHistory = this.chatHistory.slice(-10);
      }

      return responseText;
    } catch (error) {
      console.error('❌ Error communicating with Gemini AI:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      console.error('Error details:', {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown error type'
      });
      
      // Return a more helpful error message
      return `I apologize, but I'm experiencing a technical issue: ${errorMessage}

For immediate emergency assistance, please call the appropriate emergency services:

🚨 Emergency Numbers:
• Police: 100
• Fire: 101
• Ambulance: 102
• Women Helpline: 1091
• Child Helpline: 1098

Please try again in a moment, or contact emergency services directly if this is urgent.`;
    }
  }

  // Method to get quick emergency response for common situations
  async getEmergencyResponse(emergencyType: string, location: string = ''): Promise<string> {
    const prompt = `Emergency situation: ${emergencyType}${location ? ` in ${location}` : ''}. Provide immediate guidance and emergency numbers.`;
    return this.sendMessage(prompt);
  }

  // Method to get first aid guidance
  async getFirstAidGuidance(injury: string): Promise<string> {
    const prompt = `Provide first aid guidance for: ${injury}. Include immediate steps and when to call emergency services.`;
    return this.sendMessage(prompt);
  }

  // Method to clear chat history
  clearHistory(): void {
    this.chatHistory = [{
      role: 'assistant',
      content: 'Namaste! 🙏 Main aapka Emergency Response AI Assistant hoon. Emergency situations mein help karne ke liye yahan hoon. Kya help chahiye aapko?'
    }];
  }

  // Method to test API connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Gemini AI connection...');
      const testResponse = await this.sendMessage('Hello, this is a test message.');
      console.log('✅ Connection test successful:', testResponse);
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }
}

// Create a singleton instance
export const geminiAI = new GeminiAIService();
