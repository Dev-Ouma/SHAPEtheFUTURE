import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DspaceService {
  private readonly logger = new Logger(DspaceService.name);
  private readonly DSPACE_REST_URL: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Defaulting to a demo DSpace 7 REST API if not provided in env for testing
    this.DSPACE_REST_URL =
      this.configService.get<string>('DSPACE_REST_URL') ||
      'https://demo.dspace.org/server/api';
  }

  /**
   * Fetches recent publications/items from the Institutional Repository
   * @param limit Number of items to retrieve
   */
  async getRecentPublications(limit: number = 10) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.DSPACE_REST_URL}/discover/search/objects`,
          {
            params: {
              size: limit,
              sort: 'dc.date.issued,desc',
              configuration: 'default',
            },
            headers: {
              Accept: 'application/json',
            },
          },
        ),
      );

      const items =
        response.data?._embedded?.searchResult?._embedded?.objects || [];
      return items.map((obj: any) => {
        const item = obj._embedded?.indexableObject;
        const metadata = item?.metadata || {};

        return {
          id: item?.id,
          handle: item?.handle,
          title: metadata['dc.title']?.[0]?.value || 'Untitled',
          authors:
            metadata['dc.contributor.author']?.map((a: any) => a.value) || [],
          abstract: metadata['dc.description.abstract']?.[0]?.value,
          issueDate: metadata['dc.date.issued']?.[0]?.value,
          uri: metadata['dc.identifier.uri']?.[0]?.value,
          type: metadata['dc.type']?.[0]?.value || 'Publication',
        };
      });
    } catch (error) {
      this.logger.error(
        'Failed to fetch recent publications from DSpace',
        error,
      );
      return [];
    }
  }

  /**
   * Searches the repository by keyword
   */
  async searchRepository(query: string, limit: number = 10) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.DSPACE_REST_URL}/discover/search/objects`,
          {
            params: {
              query: query,
              size: limit,
            },
            headers: {
              Accept: 'application/json',
            },
          },
        ),
      );

      const items =
        response.data?._embedded?.searchResult?._embedded?.objects || [];
      // Similar mapping logic as getRecentPublications
      return items.map((obj: any) => {
        const item = obj._embedded?.indexableObject;
        const metadata = item?.metadata || {};
        return {
          id: item?.id,
          title: metadata['dc.title']?.[0]?.value || 'Untitled',
          authors:
            metadata['dc.contributor.author']?.map((a: any) => a.value) || [],
          uri: metadata['dc.identifier.uri']?.[0]?.value,
        };
      });
    } catch (error) {
      this.logger.error(`Failed to search DSpace for query: ${query}`, error);
      return [];
    }
  }
}
