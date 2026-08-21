-- Quiz answer payloads were historically embedded in /quiz/results?q= URLs.
-- Remove them from existing first-party analytics records; future writes are
-- redacted in both the browser and API.
update public.analytics_sessions
set
  entry_path = '/quiz/results',
  entry_url = split_part(entry_url, '?', 1),
  entry_intent = 'quiz'
where entry_path like '/quiz/results?q=%';

update public.analytics_events
set path = '/quiz/results'
where path like '/quiz/results?q=%';

update public.analytics_events
set target_href = split_part(target_href, '?', 1)
where target_href like '%/quiz/results?q=%';
