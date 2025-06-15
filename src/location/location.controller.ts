import { Controller, Get, Param } from '@nestjs/common';
import { LocationService } from './location.service';
@Controller('location')
export class LocationController {
    constructor(private readonly locationService: LocationService) {}
    @Get("provinces")
    async getProvinces() {
        return this.locationService.getProvinces();
    }

    @Get("/districts/:provinceId")
    async getDistricts(@Param("provinceId") provinceId: string) {
        return this.locationService.getDistricts(provinceId);
    }

    @Get("/wards/:districtId")
    async getWards(@Param("districtId") districtId: string) {
        return this.locationService.getWards(districtId);
    }
}
