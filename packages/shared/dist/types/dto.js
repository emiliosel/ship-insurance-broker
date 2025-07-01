"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationParams = exports.SubmitQuoteResponseDto = exports.UpdateQuoteStatusDto = exports.CreateQuoteRequestDto = exports.VoyageDataDto = exports.RouteDto = exports.CargoDto = exports.VesselDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const entities_1 = require("./entities");
class VesselDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VesselDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VesselDto.prototype, "imoNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VesselDto.prototype, "type", void 0);
exports.VesselDto = VesselDto;
class CargoDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CargoDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CargoDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CargoDto.prototype, "unit", void 0);
exports.CargoDto = CargoDto;
class RouteDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RouteDto.prototype, "origin", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RouteDto.prototype, "destination", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], RouteDto.prototype, "departureDate", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], RouteDto.prototype, "arrivalDate", void 0);
exports.RouteDto = RouteDto;
class VoyageDataDto {
}
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => VesselDto),
    __metadata("design:type", VesselDto)
], VoyageDataDto.prototype, "vessel", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CargoDto),
    __metadata("design:type", CargoDto)
], VoyageDataDto.prototype, "cargo", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RouteDto),
    __metadata("design:type", RouteDto)
], VoyageDataDto.prototype, "route", void 0);
exports.VoyageDataDto = VoyageDataDto;
class CreateQuoteRequestDto {
}
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => VoyageDataDto),
    __metadata("design:type", VoyageDataDto)
], CreateQuoteRequestDto.prototype, "voyageData", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], CreateQuoteRequestDto.prototype, "responderIds", void 0);
exports.CreateQuoteRequestDto = CreateQuoteRequestDto;
class UpdateQuoteStatusDto {
}
__decorate([
    (0, class_validator_1.IsEnum)(entities_1.QuoteRequestStatus),
    __metadata("design:type", String)
], UpdateQuoteStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuoteStatusDto.prototype, "reason", void 0);
exports.UpdateQuoteStatusDto = UpdateQuoteStatusDto;
class SubmitQuoteResponseDto {
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SubmitQuoteResponseDto.prototype, "premium", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubmitQuoteResponseDto.prototype, "comments", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(entities_1.ResponderAssignmentStatus),
    __metadata("design:type", String)
], SubmitQuoteResponseDto.prototype, "status", void 0);
exports.SubmitQuoteResponseDto = SubmitQuoteResponseDto;
class PaginationParams {
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PaginationParams.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PaginationParams.prototype, "limit", void 0);
exports.PaginationParams = PaginationParams;
