import React, { createContext, useState, useContext, ReactNode } from "react";

interface VideoContextProps {
  videoUrl: string;
  videoList: string[];
  videoIsPlaying?: boolean;
  [key: string]: any; // 允许添加其他动态属性
}

interface VideoProviderProps {
  children: ReactNode;
}

const VideoContext = createContext<{
  context: VideoContextProps;
  setContext: (key: keyof VideoContextProps, value: any) => void;
} | null>(null);

export const VideoProvider: React.FC<VideoProviderProps> = ({ children }) => {
  const [context, setContextState] = useState<VideoContextProps>({
    videoUrl: "",
    videoList: [],
  });

  const setContext = (key: keyof VideoContextProps, value: any) => {
    setContextState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <VideoContext.Provider value={{ context, setContext }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoContext = () => {
  const contextValue = useContext(VideoContext);
  if (!contextValue) {
    throw new Error("useVideoContext must be used within a VideoProvider");
  }
  return contextValue;
};
