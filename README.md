# 🚨 SOS - Emergency Response System

A comprehensive mobile-first emergency response application built with React, TypeScript, and Firebase. This application provides immediate emergency assistance, disaster prediction, and community support features.

## 📱 Project Overview

SOS is a modern emergency response system designed to provide quick access to emergency services, disaster prediction capabilities, and community support features. The application is built as a Progressive Web App (PWA) with Capacitor for native mobile deployment.

## ✨ Features

### 🚨 Core Emergency Features
- **SOS Button**: One-tap emergency alert with audio siren
- **Emergency Report System**: Report incidents with location and media attachments
- **Voice Recognition**: Speech-to-text for hands-free emergency reporting
- **Real-time Chatbot**: AI-powered emergency assistant with voice input

### 🏥 Health & Safety
- **Quick First Aid Guide**: Step-by-step first aid instructions
- **Emergency Call Integration**: Direct access to emergency services
- **Video Guides**: Instructional videos for emergency procedures
- **Safety Tips**: Comprehensive safety information and guidelines

### 🔮 Disaster Management
- **Disaster Prediction**: AI-powered disaster forecasting system
- **Detection Tracker**: Real-time disaster detection and monitoring
- **Location Services**: GPS-based emergency location tracking

### 👥 Community Features
- **User Authentication**: Secure login/signup with Firebase
- **Profile Management**: User profiles with emergency contacts
- **Friends System**: Connect with trusted contacts for emergency support
- **Volunteer Mode**: Toggle to offer help to others in need

### 🎯 Technical Features
- **Progressive Web App**: Works offline and installable on devices
- **Mobile-First Design**: Optimized for mobile emergency situations
- **Real-time Updates**: Live data synchronization with Firebase
- **Voice Commands**: Speech recognition for accessibility
- **Push Notifications**: Emergency alerts and updates

## 🚀 Progress Status

### ✅ Completed Features
- [x] **Authentication System**
  - User registration and login
  - Email verification
  - Password reset functionality
  - Google authentication integration

- [x] **Core Emergency Interface**
  - SOS button with audio siren
  - Emergency type selection
  - Location tracking
  - Media attachment support

- [x] **Navigation & UI**
  - Bottom navigation bar
  - Responsive design
  - Splash screen
  - Modern UI with Tailwind CSS

- [x] **Chatbot System**
  - Real-time chat interface
  - Voice input support
  - Emergency assistance responses
  - Floating chat button

- [x] **First Aid Module**
  - Quick first aid guides
  - Emergency call integration
  - Video guides
  - Safety tips and manuals

- [x] **User Management**
  - Profile management
  - Friends system
  - Emergency contacts
  - User preferences

- [x] **Disaster Management**
  - Prediction interface
  - Detection tracker
  - Real-time monitoring

### 🔄 In Progress
- [ ] **Backend Integration**
  - Emergency service API integration
  - Real-time emergency dispatch
  - Location-based emergency routing

- [ ] **Advanced Features**
  - Offline mode improvements
  - Advanced disaster prediction algorithms
  - Community emergency alerts

### 📋 Planned Features
- [ ] **Enhanced Security**
  - End-to-end encryption
  - Biometric authentication
  - Emergency contact verification

- [ ] **Advanced Analytics**
  - Emergency response analytics
  - Community safety metrics
  - Disaster pattern analysis

- [ ] **Integration Features**
  - Smart home device integration
  - Wearable device support
  - IoT sensor integration

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **Vite** - Fast build tool

### Backend & Services
- **Firebase Authentication** - User management
- **Firebase Firestore** - Real-time database
- **Firebase Analytics** - Usage tracking
- **Firebase Hosting** - Web deployment

### Mobile & PWA
- **Capacitor** - Native mobile deployment
- **Progressive Web App** - Offline functionality
- **Service Workers** - Background processing

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS compatibility

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SOS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Update `src/lib/firebase.ts` with your config

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

### Mobile Deployment

1. **Add Capacitor platforms**
   ```bash
   npx cap add android
   npx cap add ios
   ```

2. **Build and sync**
   ```bash
   npm run build
   npx cap sync
   ```

3. **Open in native IDE**
   ```bash
   npx cap open android
   npx cap open ios
   ```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### Firebase Setup
1. Enable Authentication methods (Email/Password, Google)
2. Set up Firestore database
3. Configure security rules
4. Enable Analytics (optional)

## 📱 Usage

### Emergency Response
1. **SOS Alert**: Tap the red SOS button for immediate emergency alert
2. **Report Incident**: Select emergency type and provide details
3. **Voice Commands**: Use voice input for hands-free operation
4. **Chat Assistant**: Get help from the AI chatbot

### First Aid
1. Navigate to "Quick First Aid" section
2. Select the type of emergency
3. Follow step-by-step instructions
4. Access video guides and safety tips

### Community Features
1. Create an account and verify email
2. Add emergency contacts
3. Connect with friends
4. Enable volunteer mode to help others

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Emergency Information

**For real emergencies, always call your local emergency services first:**
- **US**: 911
- **UK**: 999
- **EU**: 112
- **India**: 100 (Police), 101 (Fire), 102 (Ambulance)

This application is designed to supplement, not replace, official emergency services.

## 📞 Support

For technical support or feature requests:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**⚠️ Important**: This is a development project. For production emergency response systems, ensure compliance with local regulations and emergency service requirements.
