import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrcidService {
  private readonly logger = new Logger(OrcidService.name);
  private readonly ORCID_API_URL = 'https://pub.orcid.org/v3.0';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Fetches public profile data for a given ORCID ID
   * @param orcidId The 16-digit ORCID identifier (e.g. 0000-0002-1825-0097)
   */
  async getScholarProfile(orcidId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.ORCID_API_URL}/${orcidId}`, {
          headers: {
            Accept: 'application/json',
          },
        }),
      );
      return this.formatOrcidData(response.data);
    } catch (error) {
      this.logger.error(`Failed to fetch ORCID data for ${orcidId}`, error);
      return null;
    }
  }

  /**
   * Fetches the works/publications for a given ORCID ID
   */
  async getScholarWorks(orcidId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.ORCID_API_URL}/${orcidId}/works`, {
          headers: {
            Accept: 'application/json',
          },
        }),
      );

      const works = response.data?.group || [];
      return works.map((workGroup: any) => {
        const summary = workGroup['work-summary']?.[0];
        return {
          title: summary?.title?.title?.value,
          type: summary?.type,
          publicationYear: summary?.['publication-date']?.year?.value,
          journalTitle: summary?.['journal-title']?.value,
          url: summary?.url?.value,
          externalIds:
            summary?.['external-ids']?.['external-id']?.map((id: any) => ({
              type: id['external-id-type'],
              value: id['external-id-value'],
              url: id['external-id-url']?.value,
            })) || [],
        };
      });
    } catch (error) {
      this.logger.error(`Failed to fetch ORCID works for ${orcidId}`, error);
      return [];
    }
  }

  private formatOrcidData(rawData: any) {
    const person = rawData?.person;
    const name = person?.name;
    const emails = person?.emails?.email || [];

    return {
      orcidId: rawData?.['orcid-identifier']?.path,
      givenNames: name?.['given-names']?.value,
      familyName: name?.['family-name']?.value,
      creditName: name?.['credit-name']?.value,
      biography: person?.biography?.content,
      emails: emails.map((e: any) => e.email),
      keywords: person?.keywords?.keyword?.map((k: any) => k.content) || [],
      researcherUrls:
        person?.['researcher-urls']?.['researcher-url']?.map((u: any) => ({
          name: u['url-name'],
          url: u.url?.value,
        })) || [],
    };
  }
}
