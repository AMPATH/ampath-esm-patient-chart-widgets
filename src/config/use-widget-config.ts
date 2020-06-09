import React from "react";
import { useConfig, validateConfig } from "@openmrs/esm-module-config";

export default function useWidgetConfig<T>(key: string, schema: any): T {
  const config = useConfig()[key] as T;
  validateConfig(schema, config);
  return config;
}
