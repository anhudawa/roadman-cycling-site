'use client'

import { useState, useCallback } from 'react'
import {
  Plus,
  Trash2,
  Zap,
  Power,
  PowerOff,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { RuleField, RuleCondition, RuleAction, TaggingRule } from '@/lib/utils/tagging-rules'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FIELDS: { value: RuleField; label: string }[] = [
  { value: 'guest_name', label: 'Guest Name' },
  { value: 'title', label: 'Title' },
  { value: 'description', label: 'Description' },
  { value: 'pillar', label: 'Pillar' },
  { value: 'type', label: 'Type' },
]

const CONDITIONS: { value: RuleCondition; label: string }[] = [
  { value: 'contains', label: 'contains' },
  { value: 'equals', label: 'equals' },
  { value: 'starts_with', label: 'starts with' },
]

const ACTIONS: { value: RuleAction; label: string }[] = [
  { value: 'add_tag', label: 'Add Tag' },
  { value: 'add_topic', label: 'Add Topic' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TaggingRulesPage() {
  const [rules, setRules] = useState<TaggingRule[]>([])
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  // New rule form state
  const [field, setField] = useState<RuleField>('title')
  const [condition, setCondition] = useState<RuleCondition>('contains')
  const [value, setValue] = useState('')
  const [action, setAction] = useState<RuleAction>('add_tag')
  const [actionValue, setActionValue] = useState('')

  function handleAddRule() {
    if (!value.trim() || !actionValue.trim()) return

    const newRule: TaggingRule = {
      id: `rule-${Date.now()}`,
      field,
      condition,
      value: value.trim(),
      action,
      action_value: actionValue.trim(),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setRules((prev) => [...prev, newRule])
    setValue('')
    setActionValue('')
  }

  function handleToggle(ruleId: string) {
    setRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? { ...r, is_active: !r.is_active, updated_at: new Date().toISOString() }
          : r,
      ),
    )
  }

  function handleDelete() {
    if (!deleteTarget) return
    setRules((prev) => prev.filter((r) => r.id !== deleteTarget))
    setDeleteTarget(null)
  }

  const selectClass = cn(
    'bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2',
    'text-sm text-off-white',
    'focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral/50',
  )

  const inputClass = cn(
    'bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2',
    'text-sm text-off-white placeholder:text-mid-grey',
    'focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral/50',
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl text-off-white uppercase tracking-wide">
          Tagging Rules
        </h1>
        <p className="mt-2 text-mid-grey font-body">
          Automatically tag assets based on field conditions. Rules are evaluated when assets are created or updated.
        </p>
      </div>

      {/* Rule builder */}
      <div className="rounded-xl border border-mid-grey/20 bg-charcoal p-6 space-y-4">
        <h2 className="font-heading text-sm uppercase tracking-wider text-off-white">
          New Rule
        </h2>

        <div className="flex flex-wrap items-end gap-3">
          {/* IF */}
          <div>
            <label className="text-xs text-mid-grey mb-1 block">IF</label>
            <select
              value={field}
              onChange={(e) => setField(e.target.value as RuleField)}
              className={selectClass}
            >
              {FIELDS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="text-xs text-mid-grey mb-1 block">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as RuleCondition)}
              className={selectClass}
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Value */}
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-mid-grey mb-1 block">Value</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. cycling, nutrition..."
              className={inputClass + ' w-full'}
            />
          </div>

          {/* THEN */}
          <div>
            <label className="text-xs text-mid-grey mb-1 block">THEN</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as RuleAction)}
              className={selectClass}
            >
              {ACTIONS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action value */}
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-mid-grey mb-1 block">
              {action === 'add_tag' ? 'Tag name' : 'Topic name'}
            </label>
            <input
              type="text"
              value={actionValue}
              onChange={(e) => setActionValue(e.target.value)}
              placeholder={action === 'add_tag' ? 'Tag name...' : 'Topic name...'}
              className={inputClass + ' w-full'}
            />
          </div>

          {/* Add button */}
          <Button
            variant="primary"
            size="md"
            onClick={handleAddRule}
            disabled={!value.trim() || !actionValue.trim()}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Rule
          </Button>
        </div>
      </div>

      {/* Rule list */}
      {rules.length === 0 ? (
        <EmptyState
          icon={<Zap className="w-10 h-10" />}
          title="No tagging rules yet"
          description="Create your first rule above. Rules will automatically tag matching assets."
        />
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={cn(
                'flex items-center justify-between rounded-lg border border-mid-grey/20 bg-charcoal px-5 py-4 transition-opacity',
                !rule.is_active && 'opacity-50',
              )}
            >
              <div className="flex items-center gap-2 text-sm">
                <span className="text-mid-grey">IF</span>
                <span className="font-medium text-off-white">
                  {FIELDS.find((f) => f.value === rule.field)?.label}
                </span>
                <span className="text-mid-grey">
                  {CONDITIONS.find((c) => c.value === rule.condition)?.label}
                </span>
                <span className="font-medium text-coral">&ldquo;{rule.value}&rdquo;</span>
                <span className="text-mid-grey">THEN</span>
                <span className="font-medium text-off-white">
                  {ACTIONS.find((a) => a.value === rule.action)?.label}
                </span>
                <span className="font-medium text-coral">&ldquo;{rule.action_value}&rdquo;</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggle(rule.id)}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    rule.is_active
                      ? 'text-emerald-400 hover:bg-emerald-400/10'
                      : 'text-mid-grey hover:bg-white/10',
                  )}
                  title={rule.is_active ? 'Deactivate rule' : 'Activate rule'}
                >
                  {rule.is_active ? (
                    <Power className="w-4 h-4" />
                  ) : (
                    <PowerOff className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(rule.id)}
                  className="p-1.5 rounded-md text-mid-grey hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  title="Delete rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete rule"
        message="Are you sure you want to delete this tagging rule?"
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}
