export const selectPostsQuery = "SELECT p.id as post_id, p.user_id, p.date, p.text, u.username, u.full_name FROM posts as p JOIN users as u ON p.user_id = u.id WHERE user_id = ?";
