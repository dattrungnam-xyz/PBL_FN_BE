import { PartialType } from "@nestjs/mapped-types";
import { CreateCategoryDTO } from "./createCategory.dto";

export class UpdateCategoryDTO extends PartialType(CreateCategoryDTO) {}
