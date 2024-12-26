import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export async function getChangelogEntries() {
  const changelogDirectory = path.join(process.cwd(), 'src/content/changelog');
  
  try {
    const files = await fs.readdir(changelogDirectory);
    
    const entries = await Promise.all(
      files
        .filter((file) => file.endsWith('.mdx'))
        .map(async (file) => {
          const filePath = path.join(changelogDirectory, file);
          const fileContents = await fs.readFile(filePath, 'utf8');
          const { data, content } = matter(fileContents);

          return {
            content,
            data: {
              date: new Date(data.date.getTime() + 24 * 60 * 60 * 1000),
              version: data.version,
              title: data.title,
            },
          };
        })
    );

    return entries.sort(
      (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    );
  } catch (error) {
    console.error('Error reading changelog entries:', error);
    return [];
  }
} 