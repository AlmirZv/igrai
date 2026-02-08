declare module "mindar-compiler/src/image-target/offline-compiler.js" {
  export class OfflineCompiler {
    compileImageTargets(
      images: unknown[],
      progressCallback: (percent: number) => void
    ): Promise<void>;
    exportData(): Uint8Array;
  }
}
