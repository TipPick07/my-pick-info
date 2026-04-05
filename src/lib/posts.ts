import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

export interface PostData {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
  content: string;
}

export function getSortedPostsData(): PostData[] {
  // Get file names under /posts
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, '');

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Handle date formatting (YYYY-MM-DD)
      let dateStr = '';
      if (matterResult.data.date) {
        const dateObj = matterResult.data.date instanceof Date 
          ? matterResult.data.date 
          : new Date(matterResult.data.date);
        
        if (!isNaN(dateObj.getTime())) {
          dateStr = dateObj.toISOString().split('T')[0];
        }
      }

      // Combine the data with the slug
      return {
        slug,
        title: matterResult.data.title || '',
        date: dateStr,
        summary: matterResult.data.summary || '',
        category: matterResult.data.category || '',
        tags: matterResult.data.tags || [],
        content: matterResult.content,
      };
    });

  // Sort posts by date
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostData(slug: string): PostData | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  let dateStr = '';
  if (matterResult.data.date) {
    const dateObj = matterResult.data.date instanceof Date 
      ? matterResult.data.date 
      : new Date(matterResult.data.date);
    
    if (!isNaN(dateObj.getTime())) {
      dateStr = dateObj.toISOString().split('T')[0];
    }
  }

  return {
    slug,
    title: matterResult.data.title || '',
    date: dateStr,
    summary: matterResult.data.summary || '',
    category: matterResult.data.category || '',
    tags: matterResult.data.tags || [],
    content: matterResult.content,
  };
}
