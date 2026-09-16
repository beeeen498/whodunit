import { create } from 'zustand';

interface AudioStore {
  // Audio elements
  musicRef: HTMLAudioElement | null;
  ambientRef: HTMLAudioElement | null;

  // State
  musicUrl: string | null;
  ambientUrl: string | null;
  musicVolume: number;
  ambientVolume: number;
  isMuted: boolean;

  // Actions
  setMusicRef: (ref: HTMLAudioElement | null) => void;
  setAmbientRef: (ref: HTMLAudioElement | null) => void;
  playMusic: (url: string) => void;
  playAmbient: (url: string) => void;
  stopMusic: () => void;
  stopAmbient: () => void;
  setMusicVolume: (volume: number) => void;
  setAmbientVolume: (volume: number) => void;
  toggleMute: () => void;
  stopAll: () => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  musicRef: null,
  ambientRef: null,
  musicUrl: null,
  ambientUrl: null,
  musicVolume: 0.5,
  ambientVolume: 0.3,
  isMuted: false,

  setMusicRef: (ref) => set({ musicRef: ref }),
  setAmbientRef: (ref) => set({ ambientRef: ref }),

  playMusic: (url) => {
    const { musicRef, musicVolume, isMuted } = get();
    if (!musicRef) return;

    // Don't restart if same track is already playing
    if (get().musicUrl === url) return;

    musicRef.src = url;
    musicRef.volume = isMuted ? 0 : musicVolume;
    musicRef.loop = true;
    musicRef.play().catch(() => {});
    set({ musicUrl: url });
  },

  playAmbient: (url) => {
    const { ambientRef, ambientVolume, isMuted } = get();
    if (!ambientRef) return;

    if (get().ambientUrl === url) return;

    ambientRef.src = url;
    ambientRef.volume = isMuted ? 0 : ambientVolume;
    ambientRef.loop = true;
    ambientRef.play().catch(() => {});
    set({ ambientUrl: url });
  },

  stopMusic: () => {
    const { musicRef } = get();
    if (musicRef) {
      musicRef.pause();
      musicRef.src = '';
    }
    set({ musicUrl: null });
  },

  stopAmbient: () => {
    const { ambientRef } = get();
    if (ambientRef) {
      ambientRef.pause();
      ambientRef.src = '';
    }
    set({ ambientUrl: null });
  },

  setMusicVolume: (volume) => {
    const { musicRef, isMuted } = get();
    if (musicRef && !isMuted) musicRef.volume = volume;
    set({ musicVolume: volume });
  },

  setAmbientVolume: (volume) => {
    const { ambientRef, isMuted } = get();
    if (ambientRef && !isMuted) ambientRef.volume = volume;
    set({ ambientVolume: volume });
  },

  toggleMute: () => {
    const { musicRef, ambientRef, isMuted, musicVolume, ambientVolume } = get();

    if (isMuted) {
      // Unmute — restore volumes
      if (musicRef) musicRef.volume = musicVolume;
      if (ambientRef) ambientRef.volume = ambientVolume;
    } else {
      // Mute — set volumes to 0
      if (musicRef) musicRef.volume = 0;
      if (ambientRef) ambientRef.volume = 0;
    }

    set({ isMuted: !isMuted });
  },

  stopAll: () => {
    get().stopMusic();
    get().stopAmbient();
  },
}));
