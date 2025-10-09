import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
// Copyright (c) 2025 Tim N. (timn2bama)
// Licensed under the Apache License, Version 2.0.
// See the LICENSE file in the project root for license information.

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
