-- Insert sample users (passwords are 'password123' hashed with bcrypt)
INSERT INTO users (email, password_hash, name) VALUES
('john@example.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqQqQqQqQqQqQq', 'John Doe'),
('jane@example.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqQqQqQqQqQqQq', 'Jane Smith')
ON CONFLICT (email) DO NOTHING;

-- Insert sample notes
INSERT INTO notes (title, content, is_public, user_id) VALUES
('Welcome to NotesHub', 'This is your first note! You can create, edit, and share notes with others.', true, 1),
('Private Thoughts', 'This is a private note that only I can see.', false, 1),
('JavaScript Tips', 'Here are some useful JavaScript tips and tricks for developers.', true, 2),
('My Todo List', 'Personal tasks and reminders.', false, 2)
ON CONFLICT DO NOTHING;
