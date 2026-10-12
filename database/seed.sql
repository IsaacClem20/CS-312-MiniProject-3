
-- Sample users for Mini-Project 3
-- These are demo accounts. Passwords will be hashed later
-- when we implement signup and signin.

INSERT INTO users (user_id, password, name)
VALUES
    ('isaac', 'demo_hash_isaac', 'Isaac Clement'),
    ('maya', 'demo_hash_maya', 'Maya Chen'),
    ('alex', 'demo_hash_alex', 'Alex Rivera');

-- Sample blog posts
INSERT INTO blogs
    (creator_name, creator_user_id, title, body, date_created)
VALUES
    (
        'Isaac Clement',
        'isaac',
        'My First Week in Japan',
        'Starting a new chapter in Japan has been exciting. I am looking forward to exploring Fukuoka, improving my Japanese, and meeting new people.',
        '2026-09-27 10:00:00'
    ),
    (
        'Maya Chen',
        'maya',
        'Learning a New Language',
        'Learning a language takes patience and consistency. Practicing a little every day can make a big difference over time.',
        '2026-09-28 14:30:00'
    ),
    (
        'Alex Rivera',
        'alex',
        'Building My First Website',
        'Creating a website taught me how HTML, CSS, and JavaScript work together. My next goal is to connect it to a database.',
        '2026-09-29 09:15:00'
    ),
    (
        'Isaac Clement',
        'isaac',
        'Exploring Fukuoka',
        'Fukuoka has so much to explore, from local food stalls to parks and shopping streets. I want to discover more places outside the city center too.',
        '2026-09-30 18:00:00'
    ),
    (
        'Maya Chen',
        'maya',
        'Small Steps, Big Progress',
        'Large goals become manageable when you break them into small tasks. Staying consistent matters more than trying to do everything at once.',
        '2026-10-01 12:00:00'
    );