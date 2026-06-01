import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface PostData {
  slug: string;
  title: string;
  region?: string;
  originalTitle?: string;
  link?: string;
  image?: string;
  description?: string;
  ogImage?: string;
  officialTarget?: string;
  officialDetails?: string;
  officialDeadline?: string;
  author: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
  officialRequirements: string[];
  officialHowToApply: string[];
  officialEligibilityQuiz: string[];
  officialTip?: string;
  officialCurationNote?: string;
  content: string;
}

export function getSortedPostsData(dirName = 'posts'): PostData[] {
  const targetDirectory = path.join(process.cwd(), `src/content/${dirName}`);
  
  // Get file names under /posts
  if (!fs.existsSync(targetDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(targetDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, '');

      // Read markdown file as string
      const fullPath = path.join(targetDirectory, fileName);
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
      const img = matterResult.data.image || '';
      const ogImage = matterResult.data.ogImage ||
        (img.startsWith('http') ? img : img ? `https://tip-pick.com${img}` : 'https://tip-pick.com/images/og-default.png');

      return {
        slug,
        title: matterResult.data.title || '',
        region: matterResult.data.region || '',
        originalTitle: matterResult.data.originalTitle || '',
        link: matterResult.data.link || '',
        image: img,
        description: matterResult.data.description || matterResult.data.summary || '',
        ogImage,
        officialTarget: matterResult.data.officialTarget || '',
        officialDetails: matterResult.data.officialDetails || '',
        officialDeadline: matterResult.data.officialDeadline || '',
        author: matterResult.data.author || '팁픽(Tip-Pick)',
        date: dateStr,
        summary: matterResult.data.summary || '',
        category: matterResult.data.category || '',
        tags: matterResult.data.tags || [],
        officialRequirements: matterResult.data.officialRequirements || [],
        officialHowToApply: matterResult.data.officialHowToApply || [],
        officialEligibilityQuiz: matterResult.data.officialEligibilityQuiz || [],
        officialTip: matterResult.data.officialTip || '',
        officialCurationNote: matterResult.data.officialCurationNote || '',
        content: matterResult.content,
      };
    });

  // Sort posts by date
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostData(slug: string, dirName = 'posts'): PostData | null {
  const targetDirectory = path.join(process.cwd(), `src/content/${dirName}`);
  const fullPath = path.join(targetDirectory, `${slug}.md`);
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

  const img = matterResult.data.image || '';
  const ogImage = matterResult.data.ogImage ||
    (img.startsWith('http') ? img : img ? `https://tip-pick.com${img}` : 'https://tip-pick.com/images/og-default.png');

  return {
    slug,
    title: matterResult.data.title || '',
    region: matterResult.data.region || '',
    originalTitle: matterResult.data.originalTitle || '',
    link: matterResult.data.link || '',
    image: img,
    description: matterResult.data.description || matterResult.data.summary || '',
    ogImage,
    officialTarget: matterResult.data.officialTarget || '',
    officialDetails: matterResult.data.officialDetails || '',
    officialDeadline: matterResult.data.officialDeadline || '',
    author: matterResult.data.author || '팁픽(Tip-Pick)',
    date: dateStr,
    summary: matterResult.data.summary || '',
    category: matterResult.data.category || '',
    tags: matterResult.data.tags || [],
    officialRequirements: matterResult.data.officialRequirements || [],
    officialHowToApply: matterResult.data.officialHowToApply || [],
    officialEligibilityQuiz: matterResult.data.officialEligibilityQuiz || [],
    officialTip: matterResult.data.officialTip || '',
    officialCurationNote: matterResult.data.officialCurationNote || '',
    content: matterResult.content,
  };
}

export function getRelatedPosts(
  currentSlug: string,
  category: string,
  tags: string[],
  dirName = 'posts',
  count = 3
): PostData[] {
  const all = getSortedPostsData(dirName).filter(p => p.slug !== currentSlug);
  const scored = all.map(p => {
    const tagOverlap = p.tags.filter(t => tags.includes(t)).length;
    const sameCategory = p.category === category ? 2 : 0;
    return { post: p, score: tagOverlap + sameCategory };
  });
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(s => s.post);
}
