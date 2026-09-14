import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, isPast, isToday, isTomorrow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch {
    return '—';
  }
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    return format(new Date(dateStr), 'MMM d, yyyy HH:mm');
  } catch {
    return '—';
  }
}

export function getRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '—';
  }
}

export function isOverdue(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  try {
    return isPast(new Date(dateStr));
  } catch {
    return false;
  }
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    active: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    waiting: 'bg-amber-100 text-amber-700 border-amber-200',
    at_risk: 'bg-red-100 text-red-700 border-red-200',
    blocked: 'bg-red-200 text-red-900 border-red-300',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
    // promise statuses
    fulfilled: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    broken: 'bg-red-100 text-red-700 border-red-200',
    updated: 'bg-blue-100 text-blue-700 border-blue-200',
    // document statuses
    verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending: 'bg-gray-100 text-gray-600 border-gray-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    expired: 'bg-orange-100 text-orange-700 border-orange-200',
    // approval statuses
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    escalated: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  return map[status] || 'bg-gray-100 text-gray-600 border-gray-200';
}

export function getRiskColor(risk: string) {
  const map: Record<string, string> = {
    low: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
    critical: 'bg-red-200 text-red-900 font-bold',
  };
  return map[risk] || 'bg-gray-100 text-gray-600';
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    active: 'Active',
    waiting: 'Waiting',
    at_risk: 'At Risk',
    blocked: 'Blocked',
    completed: 'Complete',
    fulfilled: 'Fulfilled',
    broken: 'Missed',
    updated: 'Updated',
    verified: 'Verified',
    pending: 'Pending',
    rejected: 'Rejected',
    expired: 'Expired',
    approved: 'Approved',
    escalated: 'Escalated',
  };
  return map[status] || status;
}

export function getEventIcon(eventType: string): string {
  const map: Record<string, string> = {
    case_created: '📋',
    case_updated: '✏️',
    case_completed: '🎉',
    requirements_identified: '📝',
    documents_received: '📄',
    documents_verified: '✅',
    verification_started: '🔍',
    message_received: '📨',
    promise_detected: '🧠',
    promise_created: '⏰',
    promise_updated: '🔄',
    followup_scheduled: '📅',
    followup_sent: '📧',
    deadline_reached: '⏰',
    conflict_detected: '⚠️',
    human_decision_required: '🛑',
    human_decision_made: '✅',
    agent_resumed: '🤖',
    agent_completed_task: '✓',
    email_sent: '📧',
  };
  return map[eventType] || '•';
}
