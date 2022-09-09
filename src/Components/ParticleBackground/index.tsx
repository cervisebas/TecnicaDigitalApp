import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, StyleProp, View, ViewStyle } from "react-native";
import Particle from "./components/Particle/index";
import { randomIntFromInterval } from "./utils/index";

type IProps = {
  particleNumber?: number;
  particleSize: number;
  particleDispersion: number;
  particleColor: string;
  backgroundColor: string;
  containerStyle?: StyleProp<ViewStyle>;
};

const ParticleBackground = ({
  particleNumber,
  particleSize,
  particleDispersion,
  particleColor,
  backgroundColor,
  containerStyle
}: IProps) => {
  const [particles, setParticles] = useState<{ y: number; x: number; size: number; }[]>([]);
  const [componentDimensions, setComponentDimensions] = useState({
    width: 0,
    height: 0
  });

  const getParticles = () => {
    const currentParticles = [];
    const { width, height } = componentDimensions;
    const parentArea = width * height;
    const particleArea = Math.pow(particleSize + particleDispersion, 2);
    const estimatedParticleQuantity = (particleNumber !== undefined)? particleNumber: Math.floor(parentArea / particleArea);

    for (let y = 0; y < estimatedParticleQuantity; y += 1) {
      const realY = randomIntFromInterval(0, height);
      const realX = randomIntFromInterval(0, width);
      currentParticles.push({
        y: realY,
        x: realX,
        size: particleSize
      });
    }
    return currentParticles;
  };

  const setDimensions = ({ nativeEvent }: LayoutChangeEvent) => {
    const { width, height } = componentDimensions;
    if (!nativeEvent || height !== 0 || width !== 0) return;

    if (nativeEvent) {
      const { layout } = nativeEvent;
      const { width, height } = layout;
      setComponentDimensions({ width, height });
    }
  };

  useEffect(() => {
    const { width, height } = componentDimensions;
    if (height !== 0 || width !== 0) {
      requestAnimationFrame(() => {
        const generatedParticles = getParticles();
        setParticles(generatedParticles);
      });
    }
  }, [componentDimensions]);

  return (
    <View style={[containerStyle, { backgroundColor }]} onLayout={setDimensions}>
      {particles.map(({ x, y, size }, index) => (
        <Particle
          parentWidth={componentDimensions.width}
          parentHeight={componentDimensions.height}
          color={particleColor}
          initialX={x}
          initialY={y}
          size={size}
          key={index}
        />
      ))}
    </View>
  );
};

export default ParticleBackground;
