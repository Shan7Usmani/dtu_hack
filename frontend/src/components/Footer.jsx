import React from 'react';
import { Link } from 'react-router-dom';

const LINKS = [
  { to: '/technology', label: 'Technology' },
  { to: '/system', label: 'System' },
  { to: '/emergency/contacts', label: 'Contacts' },
];

export default function Footer() {
  return (
    <footer className="mt-12 border-t">
      <div className="page-gutter flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] text-muted-foreground">
          Netrakshak - webcam-based driver monitoring. No GPS, speed or alcohol sensor is connected.
        </p>
        <nav className="flex items-center gap-4" aria-label="Footer">
          {LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-[12px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
