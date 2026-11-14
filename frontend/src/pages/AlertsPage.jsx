import React, { useState } from 'react';

import { useSystem } from '../context/SessionContext';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PageHeader } from '../components/PageHeader';
import AlertCenter from '../components/AlertCenter';

export default function AlertsPage() {
  const { alerts } = useSystem();
  const [tab, setTab] = useState('all');

  const unacknowledged = alerts.filter((alert) => !alert.acknowledged);
  const visible = tab === 'open' ? unacknowledged : alerts;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Alerts"
        description="Every alert is written by the browser detector and stored in this profile. Acknowledging one updates that stored copy."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All ({alerts.length})</TabsTrigger>
            <TabsTrigger value="open">Unacknowledged ({unacknowledged.length})</TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="font-mono text-[12px] text-muted-foreground">source: localStorage</p>
      </div>

      <Card>
        <CardContent className="pt-5">
          <AlertCenter alerts={visible} loading={false} onChanged={() => {}} />
        </CardContent>
      </Card>

      <p className="text-[12px] text-muted-foreground">
        Alerts are capped at 100 entries. Nothing is transmitted; clearing browser data removes them.
      </p>
    </div>
  );
}
