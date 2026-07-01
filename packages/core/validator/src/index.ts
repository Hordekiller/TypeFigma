import type { ThemeFile } from '@typefigma/theme-builder';

export interface ValidationReport {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  performance: {
    cssSize: number;
    jsSize: number;
    imageCount: number;
  };
  accessibility: {
    contrastIssues: string[];
    missingAltText: string[];
  };
}

export interface ValidationIssue {
  file: string;
  line?: number;
  message: string;
  type: 'error' | 'warning';
}

export class Validator {
  validate(files: ThemeFile[]): ValidationReport {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];
    let cssSize = 0;
    let jsSize = 0;
    let imageCount = 0;

    for (const file of files) {
      // Check for required files
      if (file.path === 'style.css') {
        if (!file.content.includes('Theme Name:')) {
          errors.push({
            file: file.path,
            message: 'style.css missing Theme Name header',
            type: 'error',
          });
        }
      }

      if (file.path === 'index.php' && file.content.trim().length === 0) {
        errors.push({
          file: file.path,
          message: 'index.php is empty',
          type: 'error',
        });
      }

      // Check PHP syntax (basic check)
      if (file.path.endsWith('.php')) {
        const openTags = (file.content.match(/<?php/g) || []).length;

        if (openTags === 0) {
          warnings.push({
            file: file.path,
            message: 'File may be missing PHP opening tag',
            type: 'warning',
          });
        }
      }

      // Check for missing alt text in images
      if (file.path.endsWith('.html') || file.path.endsWith('.php')) {
        const imgTags = file.content.match(/<img[^>]+>/g) || [];
        for (const img of imgTags) {
          if (!img.includes('alt=')) {
            warnings.push({
              file: file.path,
              message: 'Image missing alt text',
              type: 'warning',
            });
          }
        }
      }

      // Track sizes
      const size = new Blob([file.content]).size;
      if (file.path.endsWith('.css')) cssSize += size;
      if (file.path.endsWith('.js')) jsSize += size;
      if (file.path.startsWith('assets/images/')) imageCount++;
    }

    return {
      errors,
      warnings,
      performance: {
        cssSize,
        jsSize,
        imageCount,
      },
      accessibility: {
        contrastIssues: [],
        missingAltText: warnings
          .filter(w => w.message.includes('alt text'))
          .map(w => w.file),
      },
    };
  }
}
