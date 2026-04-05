import { getSortedPostsData } from './src/lib/posts';

try {
  const posts = getSortedPostsData();
  console.log('Posts found:', posts.length);
  posts.forEach(post => {
    console.log(`- Slug: ${post.slug}, Title: ${post.title}, Date: ${post.date}`);
  });
} catch (error) {
  console.error('Error fetching posts:', error);
}
