-- ============================================================
-- Mock data seed
-- ============================================================

-- User
INSERT INTO users (
  id,
  discord_id,
  discord_username,
  discord_avatar,
  discord_email,
  created_at,
  updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '123456789012345678',
  'trailrunner_alex',
  'https://cdn.discordapp.com/avatars/123456789012345678/mock_avatar.png',
  'alex@example.com',
  now(),
  now()
);

-- Strava account linked to that user
INSERT INTO strava_accounts (
  id,
  user_id,
  strava_athlete_id,
  access_token,
  refresh_token,
  token_expires_at,
  scope,
  athlete_firstname,
  athlete_lastname,
  athlete_profile_pic,
  athlete_city,
  athlete_country,
  created_at,
  updated_at
) VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  9876543,
  'mock_access_token_abc123',
  'mock_refresh_token_xyz789',
  now() + interval '6 hours',
  'read,activity:read_all',
  'Alex',
  'Runner',
  'https://dgalywyr863hv.cloudfront.net/pictures/athletes/mock.jpg',
  'Portland',
  'USA',
  now(),
  now()
);

-- Activities
INSERT INTO strava_activities (
  id,
  strava_account_id,
  strava_activity_id,
  name,
  sport_type,
  distance_meters,
  moving_time_seconds,
  elevation_gain,
  start_date,
  raw_data,
  synced_at
) VALUES
(
  'c0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  1100000001,
  'Morning Trail Run',
  'Run',
  8450.0,
  2820,
  210.5,
  now() - interval '1 day',
  '{
    "id": 1100000001,
    "name": "Morning Trail Run",
    "sport_type": "Run",
    "distance": 8450.0,
    "moving_time": 2820,
    "elapsed_time": 3010,
    "total_elevation_gain": 210.5,
    "average_speed": 2.99,
    "max_speed": 4.8,
    "average_heartrate": 158,
    "max_heartrate": 181,
    "suffer_score": 72
  }',
  now()
),
(
  'c0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000001',
  1100000002,
  'Lunch Ride',
  'Ride',
  24800.0,
  3960,
  185.0,
  now() - interval '3 days',
  '{
    "id": 1100000002,
    "name": "Lunch Ride",
    "sport_type": "Ride",
    "distance": 24800.0,
    "moving_time": 3960,
    "elapsed_time": 4200,
    "total_elevation_gain": 185.0,
    "average_speed": 6.26,
    "max_speed": 12.1,
    "average_heartrate": 142,
    "max_heartrate": 169,
    "suffer_score": 48
  }',
  now()
),
(
  'c0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000001',
  1100000003,
  'Weekend Long Run',
  'Run',
  21100.0,
  7320,
  430.0,
  now() - interval '7 days',
  '{
    "id": 1100000003,
    "name": "Weekend Long Run",
    "sport_type": "Run",
    "distance": 21100.0,
    "moving_time": 7320,
    "elapsed_time": 7800,
    "total_elevation_gain": 430.0,
    "average_speed": 2.88,
    "max_speed": 4.2,
    "average_heartrate": 162,
    "max_heartrate": 188,
    "suffer_score": 185
  }',
  now()
),
(
  'c0000000-0000-0000-0000-000000000004',
  'b0000000-0000-0000-0000-000000000001',
  1100000004,
  'Easy Recovery Jog',
  'Run',
  5200.0,
  1980,
  55.0,
  now() - interval '10 days',
  '{
    "id": 1100000004,
    "name": "Easy Recovery Jog",
    "sport_type": "Run",
    "distance": 5200.0,
    "moving_time": 1980,
    "elapsed_time": 2010,
    "total_elevation_gain": 55.0,
    "average_speed": 2.63,
    "max_speed": 3.4,
    "average_heartrate": 131,
    "max_heartrate": 148,
    "suffer_score": 22
  }',
  now()
),
(
  'c0000000-0000-0000-0000-000000000005',
  'b0000000-0000-0000-0000-000000000001',
  1100000005,
  'Evening Swim',
  'Swim',
  2000.0,
  2400,
  0.0,
  now() - interval '14 days',
  '{
    "id": 1100000005,
    "name": "Evening Swim",
    "sport_type": "Swim",
    "distance": 2000.0,
    "moving_time": 2400,
    "elapsed_time": 2520,
    "total_elevation_gain": 0.0,
    "average_speed": 0.83,
    "max_speed": 1.1,
    "average_heartrate": 138,
    "max_heartrate": 155,
    "suffer_score": 35
  }',
  now()
);