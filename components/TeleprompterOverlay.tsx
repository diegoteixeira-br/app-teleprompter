import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  ScrollView, 
  Dimensions 
} from 'react-native';

interface TeleprompterOverlayProps {
  script: {
    id: string;
    title: string;
    content: string;
  };
  fontSize: number;
  scrollSpeed: number;
  isRolling: boolean;
}

const { height: screenHeight } = Dimensions.get('window');

const TeleprompterOverlay = forwardRef<any, TeleprompterOverlayProps>(({ 
  script, 
  fontSize, 
  scrollSpeed, 
  isRolling 
}, ref) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollPosition = useRef(0);
  const animationRef = useRef<NodeJS.Timeout>();

  useImperativeHandle(ref, () => ({
    resetScroll
  }));

  useEffect(() => {
    if (isRolling) {
      startScrolling();
    } else {
      stopScrolling();
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isRolling, scrollSpeed]);

  const startScrolling = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }

    animationRef.current = setInterval(() => {
      scrollPosition.current += scrollSpeed / 60; // 60 FPS
      
      scrollViewRef.current?.scrollTo({
        y: scrollPosition.current,
        animated: false,
      });
    }, 1000 / 60); // 60 FPS
  };

  const stopScrolling = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
  };

  const resetScroll = () => {
    scrollPosition.current = 0;
    scrollViewRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  useEffect(() => {
    // Reset scroll when script changes
    resetScroll();
  }, [script.id]);

  // Split content into paragraphs for better readability
  const paragraphs = script.content
    .split('\n')
    .filter(paragraph => paragraph.trim().length > 0);

  return (
    <View style={styles.container}>
      <View style={styles.teleprompterArea}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: screenHeight * 0.4 } // Start text in middle of screen
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false} // Disable manual scrolling
        >
          {paragraphs.map((paragraph, index) => (
            <Text
              key={index}
              style={[
                styles.teleprompterText,
                { fontSize, lineHeight: fontSize * 1.5 }
              ]}
            >
              {paragraph}
            </Text>
          ))}
          <View style={{ height: screenHeight }} />
        </ScrollView>
      </View>

      {/* Semi-transparent gradients for better readability */}
      <View style={styles.topGradient} />
      <View style={styles.bottomGradient} />
      
      {/* Reading line indicator */}
      <View style={styles.readingLine} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  teleprompterArea: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: screenHeight,
  },
  teleprompterText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  readingLine: {
    position: 'absolute',
    top: '47%',
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    borderRadius: 1,
  },
});

export default TeleprompterOverlay;