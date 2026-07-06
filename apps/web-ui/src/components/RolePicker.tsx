'use client';

import { useState } from 'react';
import type { Annotation, AnnotationSet, ComponentRole } from '@typefigma/annotations';
import { COMPONENT_ROLES, isComponentRole } from '@typefigma/annotations';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface RolePickerProps {
  selectedAnnotation: Annotation | null;
  annotationSet: AnnotationSet;
  onRoleChange: (nodeId: string, newRole: ComponentRole, notes?: string) => void;
  onExport: () => void;
  onSave?: () => void;
  saveStatus?: SaveStatus;
  saveError?: string | null;
}

function SaveIndicator({ status, error }: { status: SaveStatus; error?: string | null }) {
  if (status === 'idle') return null;
  return (
    <div className={`text-xs px-3 py-1 rounded ${status === 'saving' ? 'text-blue-400 bg-blue-400/10' : status === 'saved' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
      {status === 'saving' && 'Saving...'}
      {status === 'saved' && 'Saved'}
      {status === 'error' && `Save failed: ${error || 'Unknown error'}`}
    </div>
  );
}

export default function RolePicker({
  selectedAnnotation,
  annotationSet,
  onRoleChange,
  onExport,
  onSave,
  saveStatus,
  saveError,
}: RolePickerProps) {
  const [notes, setNotes] = useState('');

  if (!selectedAnnotation) {
    return (
      <div className="role-picker role-picker--empty p-4">
        <p className="text-zinc-500 text-sm">
          Select a component in the preview to edit its role
        </p>
      </div>
    );
  }

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    if (isComponentRole(newRole)) {
      onRoleChange(selectedAnnotation.figmaNodeId, newRole, notes);
    }
  };

  const isUserOverride = selectedAnnotation.source === 'user';

  return (
    <div className="role-picker space-y-4 p-4">
      <div className="role-picker__info space-y-1">
        <h3 className="text-sm font-medium text-white">
          {typeof selectedAnnotation.props?.name === 'string'
            ? selectedAnnotation.props.name
            : 'Component'}
        </h3>
        <p className="text-xs text-zinc-500">
          Node: {selectedAnnotation.figmaNodeId}
        </p>
        <p className="text-xs text-zinc-500">
          Source:{' '}
          <span className={isUserOverride ? 'text-amber-400' : 'text-blue-400'}>
            {selectedAnnotation.source}
          </span>
          {' | '}Confidence:{' '}
          {Math.round(selectedAnnotation.confidence * 100)}%
        </p>
        {saveStatus && <SaveIndicator status={saveStatus} error={saveError} />}
      </div>

      <div className="role-picker__role">
        <label className="block text-xs text-zinc-400 mb-1">Role</label>
        <select
          value={selectedAnnotation.role}
          onChange={handleRoleChange}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {COMPONENT_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <div className="role-picker__notes">
        <label className="block text-xs text-zinc-400 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="role-picker__actions flex gap-2">
        <button
          onClick={onExport}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm transition"
        >
          Export JSON
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(
              JSON.stringify(annotationSet, null, 2),
            );
          }}
          className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-sm transition"
        >
          Copy JSON
        </button>
        {onSave && (
          <button
            onClick={onSave}
            disabled={saveStatus === 'saving'}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-sm transition"
          >
            Save
          </button>
        )}
      </div>
    </div>
  );
}
