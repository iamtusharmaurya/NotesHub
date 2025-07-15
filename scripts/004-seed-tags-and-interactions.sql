-- Insert sample tags
INSERT INTO tags (name) VALUES
('javascript'),
('react'),
('nextjs'),
('tutorial'),
('tips'),
('personal'),
('work'),
('ideas'),
('productivity'),
('learning')
ON CONFLICT (name) DO NOTHING;

-- Add tags to existing notes
INSERT INTO note_tags (note_id, tag_id) 
SELECT 1, id FROM tags WHERE name IN ('tutorial', 'tips')
ON CONFLICT DO NOTHING;

INSERT INTO note_tags (note_id, tag_id)
SELECT 3, id FROM tags WHERE name IN ('javascript', 'tips', 'tutorial')
ON CONFLICT DO NOTHING;

-- Add some sample likes
INSERT INTO note_likes (note_id, user_id) VALUES
(1, 2),
(3, 1)
ON CONFLICT DO NOTHING;

-- Add sample comments
INSERT INTO note_comments (note_id, user_id, content) VALUES
(1, 2, 'Great introduction! Very helpful for beginners.'),
(3, 1, 'These JavaScript tips are really useful. Thanks for sharing!')
ON CONFLICT DO NOTHING;
