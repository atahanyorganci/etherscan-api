import type { FC, ReactNode } from "react";

export type Layout = FC<{ children: ReactNode }>;

export type Page<T extends Record<string, string> = never> = FC<{ params: T }>;
