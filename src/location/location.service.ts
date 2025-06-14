import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
@Injectable()
export class LocationService {
    constructor(private readonly datasource: DataSource) {
    }

    async getProvinces() {
        const provinces = await this.datasource.query(`SELECT * FROM provinces`);
        return { data: (provinces || []).map((province) => ({
            id: province.Id,
            slug: province.Slug,
            name: province.Name,
            type: province.Type,
        })) };
    }
    
    async getDistricts(provinceId: string) {
        const districts = await this.datasource.query(`SELECT * FROM districts WHERE ProvinceId = ${provinceId}`);
        return { data: (districts || []).map((district) => ({
            id: district.Id,
            provinceId: district.ProvinceId,
            name: district.Name,
            type: district.Type,
        })) };
    }

    async getWards(districtId: string) {
        const wards = await this.datasource.query(`SELECT * FROM wards WHERE DistrictId = ${districtId}`);
        return { data: (wards || []).map((ward) => ({
            id: ward.Id,
            districtId: ward.DistrictId,
            name: ward.Name,
            type: ward.Type,
        })) };
    }
}
