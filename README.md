# Infinity Notes - Advanced Drawing App

A React Native Expo app with advanced drawing capabilities using react-native-skia, featuring smooth freehand drawing, infinite canvas, zoom/pan gestures, and professional-grade tools.

## 🎨 Features

### Advanced Drawing Canvas
- **Smooth Freehand Drawing**: Uses react-native-skia for hardware-accelerated rendering
- **Infinite Canvas**: Unlimited panning in all directions
- **Pinch-to-Zoom**: Smooth zoom from 0.1x to 10x
- **Drag-to-Pan**: Intuitive canvas navigation
- **Bézier Curve Smoothing**: Catmull-Rom spline interpolation for smooth strokes
- **Point Simplification**: Optimized performance with intelligent point reduction
- **Real-time Rendering**: 60fps drawing with minimal lag

### Professional Drawing Tools
- **Color Palette**: 12 predefined colors with easy selection
- **Brush Sizes**: 8 different stroke widths (2px to 24px)
- **Draw/Erase Modes**: Toggle between drawing and erasing
- **Undo/Redo**: Full history management with unlimited steps
- **Clear Canvas**: One-tap canvas clearing with confirmation
- **Save Functionality**: Export drawings as SVG format

### Gesture Support
- **Multi-touch Gestures**: Pinch to zoom, pan to move
- **Stylus Support**: Pressure-sensitive input (where supported)
- **Finger Drawing**: Optimized for touch input
- **Gesture Conflict Resolution**: Smart gesture prioritization

### Performance Optimizations
- **Hardware Acceleration**: GPU-accelerated rendering with Skia
- **Memory Management**: Efficient stroke storage and cleanup
- **Frame Rate Optimization**: Maintains 60fps even with many strokes
- **Point Simplification**: Reduces memory usage while preserving quality

## 🛠️ Technical Architecture

### Core Technologies
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **react-native-skia**: Hardware-accelerated 2D graphics
- **react-native-gesture-handler**: Advanced gesture recognition
- **react-native-reanimated**: Smooth animations and interactions
- **TypeScript**: Type-safe development

### Key Components

#### AdvancedDrawingCanvas
```typescript
interface DrawingStroke {
  id: string;
  path: SkPath;
  color: string;
  strokeWidth: number;
  points: SkPoint[];
  smoothedPoints: SkPoint[];
  timestamp: number;
}
```

**Features:**
- Infinite canvas with unlimited panning
- Smooth zoom and pan gestures
- Real-time stroke smoothing
- Performance-optimized rendering
- Touch and stylus input support

#### DrawingTools
```typescript
interface DrawingTool {
  color: string;
  strokeWidth: number;
  mode: 'draw' | 'erase';
}
```

**Features:**
- Color picker with 12 predefined colors
- Brush size selector (2px to 24px)
- Draw/erase mode toggle
- Undo/redo controls
- Clear and save actions

### Performance Targets
- **Drawing Latency**: < 16ms (60fps)
- **Memory Usage**: < 100MB for 1000+ strokes
- **Zoom Performance**: Smooth 60fps zoom from 0.1x to 10x
- **Pan Performance**: Responsive panning with minimal lag
- **Stroke Rendering**: Real-time smoothing with < 5ms per stroke

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Expo CLI globally**
   ```bash
   npm install -g @expo/cli
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

### Development Commands

```bash
# Start development server with tunnel (recommended for physical devices)
npm run dev

# Start for specific platforms
npm run dev:android
npm run dev:ios
npm run dev:web

# Build for production
npm run build:android
npm run build:ios
npm run build:web
```

## 📱 Usage

### Drawing
1. **Select Color**: Tap the color circle to open color picker
2. **Choose Brush Size**: Tap the brush size indicator to select stroke width
3. **Draw**: Use finger or stylus to draw on the canvas
4. **Erase**: Toggle to erase mode to remove strokes

### Canvas Navigation
- **Pan**: Drag with one finger to move around the canvas
- **Zoom**: Pinch with two fingers to zoom in/out
- **Reset View**: Tap the home button to reset zoom and position

### Tools
- **Undo**: Tap the undo button to remove the last stroke
- **Redo**: Tap the redo button to restore a removed stroke
- **Clear**: Tap the trash button to clear the entire canvas
- **Save**: Tap the save button to export as SVG

## 🏗️ Project Structure

```
project/
├── app/                    # Expo Router pages
│   ├── create.tsx         # Drawing canvas page
│   ├── index.tsx          # Home page
│   └── settings.tsx       # Settings page
├── components/            # Reusable components
│   ├── AdvancedDrawingCanvas.tsx  # Main drawing component
│   ├── DrawingTools.tsx           # Tool palette
│   ├── InfiniteCanvas.tsx         # Legacy canvas (deprecated)
│   └── ...
├── contexts/              # React contexts
│   ├── ThemeContext.tsx   # Theme management
│   └── NotesContext.tsx   # Notes data management
├── services/              # Business logic services
│   ├── AnalyticsService.ts
│   └── DataService.ts
└── assets/                # Static assets
```

## 🎯 Performance Optimization

### Drawing Performance
- **Stroke Smoothing**: Catmull-Rom spline interpolation
- **Point Simplification**: Douglas-Peucker algorithm for point reduction
- **Memory Management**: Efficient stroke storage and cleanup
- **Rendering Optimization**: Hardware-accelerated Skia rendering

### Gesture Performance
- **Gesture Prioritization**: Drawing gestures take precedence over navigation
- **Touch Handling**: Optimized touch event processing
- **Animation Smoothing**: Spring animations for natural feel

### Memory Management
- **Stroke Cleanup**: Automatic cleanup of old strokes
- **History Management**: Efficient undo/redo implementation
- **Memory Monitoring**: Built-in memory usage tracking

## 🔧 Configuration

### Environment Variables
```bash
# Analytics (optional)
ANALYTICS_ENABLED=true
ANALYTICS_KEY=your_analytics_key

# Performance monitoring
PERFORMANCE_MONITORING=true
```

### Theme Configuration
The app supports light, dark, and system themes with Material Design 3 colors.

## 📊 Analytics & Monitoring

### Built-in Analytics
- Drawing session duration
- Tool usage statistics
- Performance metrics
- Error tracking

### Performance Monitoring
- Frame rate monitoring
- Memory usage tracking
- Gesture response times
- Stroke rendering performance

## 🚀 Deployment

### Android
```bash
# Build APK
npm run build:android

# Build AAB (Google Play Store)
expo build:android --type app-bundle
```

### iOS
```bash
# Build for iOS
npm run build:ios

# Archive for App Store
expo build:ios --type archive
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Shopify/react-native-skia**: Hardware-accelerated 2D graphics
- **Expo**: Development platform and tools
- **React Native**: Cross-platform mobile framework
- **Material Design**: Design system and guidelines

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code examples

---

**Built with ❤️ using React Native and Expo** 