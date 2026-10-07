-- =============================================================================
-- Optional sample data (run AFTER schema.sql).
-- Delete these rows any time — the app is fully usable without them.
-- =============================================================================

insert into public.projects (name, description, color) values
  ('Website Redesign', 'Refresh the marketing site and improve conversion.', '#6366f1'),
  ('Mobile App', 'Ship the first public beta of the iOS/Android app.', '#10b981');

insert into public.tasks (project_id, title, description, status, priority, due_date) values
  ((select id from public.projects where name = 'Website Redesign'),
   'Audit current pages', 'List every page and note what needs changing.', 'done', 'medium', current_date - 5),
  ((select id from public.projects where name = 'Website Redesign'),
   'Design new landing page', 'Figma mockups for the hero and features sections.', 'in_progress', 'high', current_date + 3),
  ((select id from public.projects where name = 'Website Redesign'),
   'Write copy for pricing page', null, 'todo', 'medium', current_date + 7),
  ((select id from public.projects where name = 'Website Redesign'),
   'Set up analytics', 'Track signups and demo requests.', 'todo', 'low', null),
  ((select id from public.projects where name = 'Mobile App'),
   'Implement authentication', 'Email + password first, social later.', 'in_progress', 'high', current_date + 10),
  ((select id from public.projects where name = 'Mobile App'),
   'Push notification service', 'Use FCM and APNs.', 'todo', 'medium', current_date - 2),
  ((select id from public.projects where name = 'Mobile App'),
   'App store screenshots', null, 'todo', 'low', null);

update public.tasks
set completed_at = now()
where status = 'done' and completed_at is null;
