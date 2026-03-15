import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ticketApi } from '@/services/api';
import type { Ticket } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Ticket as TicketIcon, Plus, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  pending_close: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  escalated: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  closed: 'bg-muted text-muted-foreground',
  archived: 'bg-muted text-muted-foreground',
};

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  pending_close: 'Pending Close',
  escalated: 'Escalated',
  closed: 'Closed',
  archived: 'Archived',
};

const PRIORITY_BADGE: Record<string, string> = {
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export default function TicketsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await ticketApi.list(token, {
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setTickets(data);
    } catch {
      console.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!token || !subject) return;
    setCreating(true);
    try {
      await ticketApi.create(token, subject, description);
      setSubject('');
      setDescription('');
      setShowCreate(false);
      load();
    } catch {
      console.error('Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TicketIcon className="h-6 w-6" />
            Tickets
          </h2>
          <p className="text-sm text-muted-foreground">
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="mr-1 h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="mr-1 h-4 w-4" />
            New Ticket
          </Button>
        </div>
      </div>

      {showCreate && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div>
              <Label>Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of the issue"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={creating || !subject}>
                {creating ? 'Creating...' : 'Submit Ticket'}
              </Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TicketIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No tickets</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create a ticket to report issues or request support
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="font-medium">{ticket.subject}</p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                    {ticket.user_email && <span>by {ticket.user_email}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={PRIORITY_BADGE[ticket.priority] || ''}>
                    {ticket.priority}
                  </Badge>
                  <Badge className={STATUS_BADGE[ticket.status] || ''}>
                    {STATUS_LABEL[ticket.status] || ticket.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
