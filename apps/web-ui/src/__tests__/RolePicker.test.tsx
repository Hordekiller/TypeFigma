import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import RolePicker from '../components/RolePicker';
import { COMPONENT_ROLES } from '@typefigma/annotations';
import type { AnnotationSet, Annotation } from '@typefigma/annotations';

const baseAnnotation: Annotation = {
  figmaNodeId: 'h1',
  domSelector: '[data-tf-node-id="h1"]',
  role: 'header',
  source: 'auto',
  confidence: 0.85,
  updatedAt: '2025-01-01T00:00:00.000Z',
};

const annotationSet: AnnotationSet = {
  schemaVersion: 1,
  figmaFileKey: 'test-key',
  annotations: [baseAnnotation],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

describe('RolePicker', () => {
  it('shows empty state when no annotation selected', () => {
    render(
      <RolePicker
        selectedAnnotation={null}
        annotationSet={annotationSet}
        onRoleChange={vi.fn()}
        onExport={vi.fn()}
      />,
    );
    expect(screen.getByText(/select a component/i)).toBeInTheDocument();
  });

  it('displays component info when annotation is selected', () => {
    render(
      <RolePicker
        selectedAnnotation={baseAnnotation}
        annotationSet={annotationSet}
        onRoleChange={vi.fn()}
        onExport={vi.fn()}
      />,
    );
    expect(screen.getByText('Component')).toBeInTheDocument();
    expect(screen.getByText(/h1/)).toBeInTheDocument();
    expect(screen.getByText(/auto/)).toBeInTheDocument();
    expect(screen.getByText(/85%/)).toBeInTheDocument();
  });

  it('shows all roles from the canonical COMPONENT_ROLES list in the dropdown', () => {
    render(
      <RolePicker
        selectedAnnotation={baseAnnotation}
        annotationSet={annotationSet}
        onRoleChange={vi.fn()}
        onExport={vi.fn()}
      />,
    );
    const select = screen.getByRole('combobox');
    const options = select.querySelectorAll('option');
    expect(options.length).toBe(COMPONENT_ROLES.length);
    COMPONENT_ROLES.forEach((role) => {
      expect(screen.getByText(role)).toBeInTheDocument();
    });
  });

  it('calls onRoleChange when a new role is selected', () => {
    const onRoleChange = vi.fn();
    render(
      <RolePicker
        selectedAnnotation={baseAnnotation}
        annotationSet={annotationSet}
        onRoleChange={onRoleChange}
        onExport={vi.fn()}
      />,
    );
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'hero' } });
    expect(onRoleChange).toHaveBeenCalledWith('h1', 'hero', '');
  });

  it('shows user source style when annotation source is user', () => {
    const userAnnotation: Annotation = { ...baseAnnotation, source: 'user', confidence: 1 };
    render(
      <RolePicker
        selectedAnnotation={userAnnotation}
        annotationSet={annotationSet}
        onRoleChange={vi.fn()}
        onExport={vi.fn()}
      />,
    );
    const sourceEl = screen.getByText('user');
    expect(sourceEl).toBeInTheDocument();
    expect(sourceEl.className).toContain('amber');
  });

  it('calls onExport when export button is clicked', () => {
    const onExport = vi.fn();
    render(
      <RolePicker
        selectedAnnotation={baseAnnotation}
        annotationSet={annotationSet}
        onRoleChange={vi.fn()}
        onExport={onExport}
      />,
    );
    fireEvent.click(screen.getByText('Export JSON'));
    expect(onExport).toHaveBeenCalledOnce();
  });

  it('does not call onRoleChange for an invalid role', () => {
    const onRoleChange = vi.fn();
    render(
      <RolePicker
        selectedAnnotation={baseAnnotation}
        annotationSet={annotationSet}
        onRoleChange={onRoleChange}
        onExport={vi.fn()}
      />,
    );
    const select = screen.getByRole('combobox');
    // Fire change with a value that is NOT a ComponentRole
    fireEvent.change(select, { target: { value: 'not-a-valid-role' } });
    expect(onRoleChange).not.toHaveBeenCalled();
  });
});
