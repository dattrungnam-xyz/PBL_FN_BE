import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
@Injectable()
export class LocationService {
    constructor(private readonly datasource: DataSource) {
    }

    async getProvinces() {
        const provinces = await this.datasource.query(`SELECT * FROM provinces`);
        return { data: provinces };
    }
    
    async getDistricts(provinceId: string) {
        const districts = await this.datasource.query(`SELECT * FROM districts WHERE ProvinceId = ${provinceId}`);
        return { data: districts };
    }

    async getWards(districtId: string) {
        const wards = await this.datasource.query(`SELECT * FROM wards WHERE DistrictId = ${districtId}`);
        return { data: wards };
    }
}
