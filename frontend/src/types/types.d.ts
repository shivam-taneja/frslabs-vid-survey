declare global {
  interface ScreenOrientation {
    lock(
      orientation:
        | "any"
        | "natural"
        | "portrait"
        | "portrait-primary"
        | "portrait-secondary"
        | "landscape"
        | "landscape-primary"
        | "landscape-secondary",
    ): Promise<void>;
    unlock(): void;
  }
}

export {};
