import React, { useState } from 'react';
import { Plus } from 'lucide-react';

import { useSystem } from '../context/SessionContext';
import { useToast } from '../components/ui/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge, StatusBadge } from '../components/ui/badge';
import { EmptyState } from '../components/ui/empty-state';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { PageHeader } from '../components/PageHeader';

const SEEDED_IDS = ['CNT-001', 'CNT-002'];
const EMPTY_FORM = { name: '', relationship: '', phone: '', priority: '1' };

const isSample = (contact) => Boolean(contact.is_sample) || SEEDED_IDS.includes(contact.id);

export default function ContactsPage() {
  const { contacts, addContact } = useSystem();
  const { pushToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'A name is required.';
    if (!form.phone.trim()) next.phone = 'A phone number is required.';
    else if (!/^[+0-9][0-9 ()-]{5,19}$/.test(form.phone.trim())) next.phone = 'Use digits, spaces, +, - or ().';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    const result = addContact({
      name: form.name,
      relationship: form.relationship,
      phone: form.phone,
      priority: form.priority,
    });
    if (result.ok) {
      setForm(EMPTY_FORM);
      pushToast({
        tone: 'signal',
        title: 'Contact added',
        message: 'Stored in this browser profile and included in the simulated dispatch record.',
      });
    } else {
      pushToast({ tone: 'danger', title: 'Could not add contact', message: result.error });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Emergency contacts"
        description="The people the simulated gateway would notify. Entries live in this browser profile and are cleared when site data is removed."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Contact list</CardTitle>
            <CardDescription>Persisted in localStorage</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {contacts.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Relationship</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="w-24">Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{contact.name}</span>
                          {isSample(contact) && <Badge variant="outline">Sample</Badge>}
                        </div>
                        <p className="font-mono text-[11px] text-muted-foreground">{contact.id}</p>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">{contact.relationship}</TableCell>
                      <TableCell className="font-mono text-[12px] tabular">{contact.phone}</TableCell>
                      <TableCell>
                        <StatusBadge tone="neutral" dot={false}>
                          {contact.priority}
                        </StatusBadge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="No contacts" description="Add the first contact with the form." />
            )}
            <p className="mt-3 text-[12px] text-muted-foreground">
              Rows marked Sample are placeholders shipped with the build, not real people.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add contact</CardTitle>
            <CardDescription>Stored locally, never uploaded</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-3" onSubmit={submit} noValidate>
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-muted-foreground">Name</span>
                <input
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Full name"
                  className="h-9 rounded-md border bg-background px-3 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {errors.name && <span className="text-[12px] text-destructive">{errors.name}</span>}
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-muted-foreground">Relationship</span>
                <input
                  value={form.relationship}
                  onChange={update('relationship')}
                  placeholder="Spouse, fleet desk..."
                  className="h-9 rounded-md border bg-background px-3 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-muted-foreground">Phone</span>
                <input
                  value={form.phone}
                  onChange={update('phone')}
                  inputMode="tel"
                  placeholder="+91 90000 00000"
                  className="h-9 rounded-md border bg-background px-3 font-mono text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {errors.phone && <span className="text-[12px] text-destructive">{errors.phone}</span>}
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-muted-foreground">Priority</span>
                <select
                  value={form.priority}
                  onChange={update('priority')}
                  className="h-9 rounded-md border bg-background px-2 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>

              <Button type="submit" size="sm" className="mt-1">
                <Plus className="size-4" />
                Add contact
              </Button>
              <p className="text-[12px] leading-relaxed text-muted-foreground">
                No message is sent from this page. The number only appears in the simulated dispatch record.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
