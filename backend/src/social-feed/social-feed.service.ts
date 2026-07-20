import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';

export interface SocialPost {
  id: string;
  platform: 'facebook' | 'twitter' | 'instagram';
  content: string;
  mediaUrl?: string;
  postUrl: string;
  createdAt: string;
  authorName: string;
  authorHandle: string;
}

@Injectable()
export class SocialFeedService {
  private readonly logger = new Logger(SocialFeedService.name);

  constructor(private readonly settingsService: SettingsService) {}

  async getCombinedFeed(): Promise<SocialPost[]> {
    const settings = await this.settingsService.findAll();

    const [fbPosts, twPosts, igPosts] = await Promise.all([
      this.fetchFacebookPosts(settings),
      this.fetchTwitterPosts(settings),
      this.fetchInstagramPosts(settings),
    ]);

    const combined = [...fbPosts, ...twPosts, ...igPosts];
    // Sort descending by date
    combined.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return combined;
  }

  private async fetchFacebookPosts(settings: any): Promise<SocialPost[]> {
    const pageId = settings['facebook_page_id'];
    const token = settings['facebook_access_token'];

    if (!pageId || !token) return [];

    try {
      const url = `https://graph.facebook.com/v19.0/${pageId}/posts?fields=id,message,created_time,full_picture,permalink_url&limit=10&access_token=${token}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        this.logger.error(`Facebook API Error: ${data.error.message}`);
        return [];
      }

      return (data.data || []).map((post: any) => ({
        id: `fb_${post.id}`,
        platform: 'facebook',
        content: post.message || '',
        mediaUrl: post.full_picture || undefined,
        postUrl: post.permalink_url || `https://facebook.com/${post.id}`,
        createdAt: post.created_time,
        authorName: 'Open University of Kenya',
        authorHandle: 'openuniversitykenya',
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch Facebook posts: ${error.message}`);
      return [];
    }
  }

  private async fetchTwitterPosts(settings: any): Promise<SocialPost[]> {
    const username = settings['twitter_username'];
    const token = settings['twitter_bearer_token'];

    if (!username || !token) return [];

    try {
      // First, we need the user ID
      const userRes = await fetch(
        `https://api.twitter.com/2/users/by/username/${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const userData = await userRes.json();

      if (userData.errors || !userData.data) {
        this.logger.error(
          `Twitter User API Error: ${userData.errors?.[0]?.detail || 'User not found'}`,
        );
        return [];
      }

      const userId = userData.data.id;

      // Now fetch tweets
      const url = `https://api.twitter.com/2/users/${userId}/tweets?expansions=attachments.media_keys&media.fields=url&tweet.fields=created_at&max_results=10`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.errors) {
        this.logger.error(`Twitter Tweets API Error: ${data.errors[0].detail}`);
        return [];
      }

      const mediaMap = new Map();
      if (data.includes?.media) {
        data.includes.media.forEach((m: any) => {
          mediaMap.set(m.media_key, m.url);
        });
      }

      return (data.data || []).map((tweet: any) => {
        let mediaUrl = undefined;
        if (tweet.attachments?.media_keys?.length > 0) {
          mediaUrl = mediaMap.get(tweet.attachments.media_keys[0]);
        }

        return {
          id: `tw_${tweet.id}`,
          platform: 'twitter',
          content: tweet.text || '',
          mediaUrl,
          postUrl: `https://twitter.com/${username}/status/${tweet.id}`,
          createdAt: tweet.created_at,
          authorName: 'Open University of Kenya',
          authorHandle: username,
        };
      });
    } catch (error) {
      this.logger.error(`Failed to fetch Twitter posts: ${error.message}`);
      return [];
    }
  }

  private async fetchInstagramPosts(settings: any): Promise<SocialPost[]> {
    const accountId = settings['instagram_account_id'];
    const token = settings['instagram_access_token'];

    if (!accountId || !token) return [];

    try {
      const url = `https://graph.facebook.com/v19.0/${accountId}/media?fields=id,caption,media_type,media_url,permalink,timestamp&limit=10&access_token=${token}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        this.logger.error(`Instagram API Error: ${data.error.message}`);
        return [];
      }

      return (data.data || []).map((media: any) => ({
        id: `ig_${media.id}`,
        platform: 'instagram',
        content: media.caption || '',
        mediaUrl:
          media.media_type === 'IMAGE' || media.media_type === 'CAROUSEL_ALBUM'
            ? media.media_url
            : undefined,
        postUrl: media.permalink || `https://instagram.com/p/${media.id}`,
        createdAt: media.timestamp,
        authorName: 'Open University of Kenya',
        authorHandle: 'openuniversitykenya',
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch Instagram posts: ${error.message}`);
      return [];
    }
  }
}
