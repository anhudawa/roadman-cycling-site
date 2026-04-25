import { requireAuth } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

interface Section {
  id: string;
  title: string;
  adminOnly?: boolean;
}

const SECTIONS: Section[] = [
  { id: "quick-start", title: "Quick start" },
  { id: "my-day", title: "My Day" },
  { id: "contacts", title: "Contacts" },
  { id: "pipeline", title: "Pipeline (applications)" },
  { id: "deals", title: "Deals" },
  { id: "email", title: "Email" },
  { id: "segments", title: "Segments" },
  { id: "automations", title: "Automations" },
  { id: "lead-scoring", title: "Lead scoring" },
  { id: "reports", title: "Reports" },
  { id: "bookings", title: "Bookings" },
  { id: "tags", title: "Tags" },
  { id: "shortcuts", title: "Shortcuts" },
  { id: "admins", title: "For admins only", adminOnly: true },
];

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="font-heading text-xl text-off-white tracking-wider uppercase mt-12 mb-3 scroll-mt-24"
    >
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-foreground-muted leading-relaxed mb-3">{children}</p>;
}

function C({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[12px] text-off-white font-mono">
      {children}
    </code>
  );
}

function B({ children }: { children: React.ReactNode }) {
  return <strong className="text-off-white font-semibold">{children}</strong>;
}

export default async function HelpPage() {
  await requireAuth();

  return (
    <div className="flex gap-10">
      {/* Left rail ToC */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-6">
          <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium mb-3">
            On this page
          </p>
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block text-xs text-foreground-muted hover:text-[var(--color-fg)] transition-colors py-1"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Content */}
      <article className="max-w-3xl flex-1">
        <div className="mb-8">
          <h1 className="font-heading text-3xl text-off-white tracking-wider uppercase">
            CRM Help
          </h1>
          <p className="text-sm text-foreground-muted mt-2">
            How to use the Roadman CRM day-to-day. Bookmark this page.
          </p>
        </div>

        <H2 id="quick-start">Quick start</H2>
        <P>
          The CRM is where every lead, application, booking, and customer lives. Contacts are the
          spine $€” everything else (applications, deals, emails, tasks, bookings) hangs off a
          contact. Your job most days is to keep things moving: reply to what needs replying to,
          push applications down the pipeline, and log what happened so the rest of the team has
          context.
        </P>
        <P>
          <B>The 4 pages you&apos;ll use daily:</B>
        </P>
        <ul className="text-sm text-foreground-muted space-y-1 mb-3 list-disc pl-5">
          <li>
            <C>/admin/my-day</C> $€” your personal queue: tasks due, bookings today, applications
            waiting on you.
          </li>
          <li>
            <C>/admin/contacts</C> $€” search, filter, and open any person.
          </li>
          <li>
            <C>/admin/applications</C> $€” kanban of cohort applications.
          </li>
          <li>
            <C>/admin/tasks</C> $€” every follow-up you&apos;ve committed to.
          </li>
        </ul>

        <H2 id="my-day">My Day</H2>
        <P>
          <C>/admin/my-day</C> is scoped to you (by your team slug). It surfaces: <B>overdue and
          due-today tasks</B>, <B>bookings scheduled for today</B>, and <B>applications assigned
          to you that are awaiting a response</B>. Clearing My Day each morning is the single
          habit that keeps the pipeline healthy.
        </P>

        <H2 id="contacts">Contacts</H2>
        <P>
          A <B>contact</B> is one human $€” identified by email. Anyone who books a call, fills an
          application, subscribes to the newsletter, or buys something becomes a contact. The
          system <B>upserts</B> by email, so you won&apos;t get duplicates from repeat form fills.
        </P>
        <P>
          Open a contact to see the <B>timeline</B> $€” every touchpoint in chronological order:
          emails, app submissions, stage changes, notes, booking activity. Add a <B>note</B> with{" "}
          <C>@mention</C> to ping a teammate (they get a notification). Drop files on the{" "}
          <B>attachments</B> section (contracts, screenshots, etc.). Use <B>custom fields</B> for
          structured data specific to Roadman (e.g. bike type, FTP, target event).
        </P>
        <P>
          If you find two records for the same person, use <B>Merge duplicates</B> on the contact
          detail page $€” the older contact absorbs the newer one and keeps the combined timeline.{" "}
          <B>Saved views</B> are filter shortcuts: build a filter you&apos;ll rerun (e.g. &quot;UK
          + high intent + no booking&quot;) and save it so it&apos;s one click next time.
        </P>

        <H2 id="pipeline">Pipeline (applications)</H2>
        <P>
          <C>/admin/applications</C> is a kanban board of <B>cohort applications</B> only. Stages:{" "}
          <B>new</B> (just submitted, unread) $†’ <B>reviewing</B> (you&apos;ve read it) $†’{" "}
          <B>awaiting_response</B> (ball is in their court) $†’ <B>accepted</B> / <B>rejected</B>.
          Drag cards to change stage. Each app has an <B>owner</B> $€” assign yourself when you pick
          it up, so My Day surfaces it.
        </P>

        <H2 id="deals">Deals</H2>
        <P>
          <B>Deals</B> are for 1-1 coaching and any non-cohort revenue opportunity. Think of it
          this way: <B>applications = cohort only</B>, <B>deals = everything else with a dollar
          value</B>. Each deal has a stage (<C>lead</C> $†’ <C>qualified</C> $†’ <C>proposal</C> $†’{" "}
          <C>won</C> / <C>lost</C>), a value in USD, and an owner. Mark won/lost honestly $€”
          that&apos;s what powers the revenue reports.
        </P>

        <H2 id="email">Email</H2>
        <P>
          Use <B>templates</B> (<C>/admin/templates</C>) for anything you send more than twice.
          From a contact page, hit <B>Send email</B>, pick a template or write freeform; we swap
          in the merge fields. Sends go through <B>Resend</B>, and <B>Reply-To</B> is set to your
          personal team email so the reply comes back to you, not a generic inbox.
        </P>
        <P>
          <B>Open/click tracking</B> comes back via the Resend webhook and shows on the contact
          timeline. Note: this requires <C>RESEND_WEBHOOK_SECRET</C> to be set in env $€” if opens
          aren&apos;t showing up, check Settings.
        </P>

        <H2 id="segments">Segments</H2>
        <P>
          <B>Segments</B> vs <B>saved views</B>: segments are first-class objects at{" "}
          <C>/admin/segments</C> with a name, a filter definition, and a <B>bulk email</B> action.
          Saved views are just personal filter shortcuts on the contacts page. If you want to
          email a group, build a segment. If you just want quick access to a filter, save a view.
        </P>

        <H2 id="automations">Automations</H2>
        <P>
          <C>/admin/automations</C> lets you wire <B>triggers</B> (e.g. <C>contact.created</C>,{" "}
          <C>application.stage_changed</C>) to <B>actions</B> (send email, add tag, create task,
          assign owner). Each automation has safety controls: <B>max_runs_per_day</B>,{" "}
          <B>dedupe_window_minutes</B>, and a global kill switch via the{" "}
          <C>AUTOMATIONS_DISABLED</C> env var.
        </P>
        <P>
          <span className="inline-block px-2 py-1 rounded bg-amber-500/10 text-amber-300 text-xs font-medium mb-2">
            Warning
          </span>
          <br />
          Email actions fire <B>synchronously</B>. Do <B>not</B> enable an email automation on{" "}
          <C>contact.created</C> if you have a large CSV import pending $€” it&apos;ll blast
          everyone on the import. Stage the import first, or flip the kill switch during the
          import.
        </P>

        <H2 id="lead-scoring">Lead scoring</H2>
        <P>
          Every contact has a <B>lead score</B> (0$€“100) and a <B>band</B>: <B>cold</B> (0$€“30),{" "}
          <B>warm</B> (31$€“65), <B>hot</B> (66$€“100). The score measures engagement $€” email opens,
          page visits, application submitted, booking completed, recency. Scores recompute
          nightly at <B>06:30 UTC</B> via the <C>/api/cron/score-all</C> cron.
        </P>

        <H2 id="reports">Reports</H2>
        <P>
          <C>/admin/reports</C> shows the state of the business: new contacts this week,
          application funnel conversion, deal revenue by stage, cohort fill. Hover any widget for
          the underlying filter.
        </P>

        <H2 id="bookings">Bookings</H2>
        <P>
          <C>/admin/bookings</C> is the single calendar of calls. Create a booking from a contact
          page (Schedule call). Statuses: <B>scheduled</B>, <B>completed</B>, <B>cancelled</B>,{" "}
          <B>no_show</B>. Mark completed after the call so it lands in reports and clears from My
          Day.
        </P>

        <H2 id="tags">Tags</H2>
        <P>
          Tags are freeform $€” which means they sprawl. Every month or so, head to{" "}
          <C>/admin/tags</C> to rename, merge, or delete tags. Keep the living taxonomy clean;
          filters are only as good as the tags they target.
        </P>

        <H2 id="shortcuts">Shortcuts</H2>
        <P>
          <B>Cmd+K</B> opens the command palette $€” search contacts, jump to pages, run common
          actions. The <B>sidebar</B> groups pages by purpose (Personal / Analytics / Growth /
          etc.). The <B>notification bell</B> in the top bar shows @mentions and system alerts $€”
          check it morning and evening.
        </P>

        <H2 id="admins">For admins only</H2>
        <P>
          <C>/admin/settings</C> is admin-only. It includes: <B>env health</B> (are all secrets
          set?), <B>cron health</B> (did the nightly jobs run?), <B>team user management</B>
          (add, rotate password, deactivate), <B>custom field definitions</B>, and manual{" "}
          <B>sync triggers</B> for Beehiiv/Stripe. The <B>automation safety</B> row shows whether
          the global kill switch is flipped.
        </P>
        <P>
          When adding a new team member: create them in settings, share the one-time password,
          tell them to log in and change it. When someone leaves: deactivate (don&apos;t delete) $€”
          that preserves history in the timeline and reports.
        </P>
      </article>
    </div>
  );
}
