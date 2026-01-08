export const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const playPcmAudio = async (pcmData: Uint8Array, sampleRate: number = 24000) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Convert 16-bit PCM to Float32
  const inputData = new Int16Array(pcmData.buffer);
  const buffer = audioContext.createBuffer(1, inputData.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  
  for (let i = 0; i < inputData.length; i++) {
    // Normalize to -1.0 to 1.0
    channelData[i] = inputData[i] / 32768.0;
  }

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();
  
  return new Promise<void>((resolve) => {
    source.onended = () => {
      audioContext.close();
      resolve();
    };
  });
};
