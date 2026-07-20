/**
 * Scholarly Citation Formatter Utility
 * Supports APA, BibTeX, and RIS formats for institutional research outputs.
 */

export interface PublicationData {
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  publisher?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
}

/**
 * Generates an APA-style citation
 */
export function generateAPA(pub: PublicationData): string {
  const authorStr = pub.authors.join(', ');
  const source = pub.journal || pub.publisher || 'Research Repository';
  const volIssue = pub.volume ? `${pub.volume}${pub.issue ? `(${pub.issue})` : ''}` : '';
  const pages = pub.pages ? `, ${pub.pages}` : '';
  const doi = pub.doi ? `. https://doi.org/${pub.doi}` : '';

  return `${authorStr} (${pub.year}). ${pub.title}. ${source}, ${volIssue}${pages}${doi}`;
}

/**
 * Generates a BibTeX entry
 */
export function generateBibTeX(pub: PublicationData): string {
  const key = `${pub.authors[0]?.split(' ').pop() || 'Scholar'}${pub.year}`;
  const authors = pub.authors.join(' and ');
  
  let bib = `@article{${key},\n`;
  bib += `  title = {${pub.title}},\n`;
  bib += `  author = {${authors}},\n`;
  bib += `  year = {${pub.year}},\n`;
  if (pub.journal) bib += `  journal = {${pub.journal}},\n`;
  if (pub.publisher) bib += `  publisher = {${pub.publisher}},\n`;
  if (pub.volume) bib += `  volume = {${pub.volume}},\n`;
  if (pub.issue) bib += `  number = {${pub.issue}},\n`;
  if (pub.pages) bib += `  pages = {${pub.pages}},\n`;
  if (pub.doi) bib += `  doi = {${pub.doi}},\n`;
  bib += `}`;
  
  return bib;
}

/**
 * Generates an RIS (Research Information Systems) entry
 */
export function generateRIS(pub: PublicationData): string {
  let ris = `TY  - JOUR\n`;
  ris += `TI  - ${pub.title}\n`;
  pub.authors.forEach(author => {
    ris += `AU  - ${author}\n`;
  });
  ris += `PY  - ${pub.year}\n`;
  if (pub.journal) ris += `JO  - ${pub.journal}\n`;
  if (pub.publisher) ris += `PB  - ${pub.publisher}\n`;
  if (pub.volume) ris += `VL  - ${pub.volume}\n`;
  if (pub.issue) ris += `IS  - ${pub.issue}\n`;
  if (pub.pages) ris += `SP  - ${pub.pages}\n`;
  if (pub.doi) ris += `DO  - ${pub.doi}\n`;
  if (pub.url) ris += `UR  - ${pub.url}\n`;
  ris += `ER  - `;

  return ris;
}
