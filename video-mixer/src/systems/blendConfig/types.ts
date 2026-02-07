export interface BlendProtectionConfig {
  enabled: boolean;
  minBlendStrength: number;
  rampPower: number;
  darkSensitiveModes: string[];
}

export interface BlendModeSettings {
  intensity: number;
}

export interface BlendModesConfig {
  protection: BlendProtectionConfig;
  modes: Record<string, BlendModeSettings>;
}
