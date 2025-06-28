import { IDataAnalysisPreset } from "../types";
import { presets } from "../presets/index.js";

class PresetManager {
  private presets: Map<string, IDataAnalysisPreset> = new Map();

  constructor() {
    this.loadAllPresets();
  }

  private loadAllPresets() {
    presets.forEach((preset) => {
      this.addPreset(preset);
    });
  }

  public addPreset(preset: IDataAnalysisPreset): void {
    this.presets.set(preset.id, preset);
  }

  public getPreset(id: string): IDataAnalysisPreset {
    return this.presets.get(id);
  }
}

export const presetManager = new PresetManager();
