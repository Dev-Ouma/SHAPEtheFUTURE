import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InformationLiteracyConfig } from './entities/information-literacy.entity';

@Injectable()
export class InformationLiteracyService {
  constructor(
    @InjectRepository(InformationLiteracyConfig)
    private readonly configRepository: Repository<InformationLiteracyConfig>,
  ) {}

  async getConfig() {
    let config = await this.configRepository.findOne({ where: {} });

    // Auto-seed initial empty configuration if it doesn't exist
    if (!config) {
      config = this.configRepository.create({});
      await this.configRepository.save(config);
    }

    return config;
  }

  async updateConfig(updateData: Partial<InformationLiteracyConfig>) {
    let config = await this.configRepository.findOne({ where: {} });

    if (!config) {
      config = this.configRepository.create(updateData);
    } else {
      Object.assign(config, updateData);
    }

    return this.configRepository.save(config);
  }
}
