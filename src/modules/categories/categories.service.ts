import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; // ✅ added Types
import { Category, CategoryDocument } from '../../schemas/category.schema';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
  ) {}

  // ✅ Convert name → slug
  private toSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  // ✅ GET ALL
  async findAll() {
    const categories = await this.categoryModel
      .find()
      .sort({ name: 1 });

    return { data: categories };
  }

  // ✅ GET ONE (SAFE)
  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }

    const cat = await this.categoryModel.findById(id);

    if (!cat) {
      throw new NotFoundException('Category not found');
    }

    return { data: cat };
  }

  // ✅ CREATE
  async create(dto: CreateCategoryDto) {
    const slug = this.toSlug(dto.name);

    const existing = await this.categoryModel.findOne({ slug });

    if (existing) {
      throw new ConflictException('Category already exists');
    }

    const category = await this.categoryModel.create({
      ...dto,
      slug,
    });

    return {
      data: category,
      message: 'Category created successfully',
    };
  }

  // ✅ UPDATE
  async update(id: string, dto: UpdateCategoryDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }

    const updateData: any = { ...dto };

    // Handle name → slug update
    if (dto.name) {
      updateData.slug = this.toSlug(dto.name);

      const existing = await this.categoryModel.findOne({
        slug: updateData.slug,
        _id: { $ne: id },
      });

      if (existing) {
        throw new ConflictException(
          'Category name already in use',
        );
      }
    }

    const updatedCategory = await this.categoryModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedCategory) {
      throw new NotFoundException('Category not found');
    }

    return {
      data: updatedCategory,
      message: 'Category updated successfully',
    };
  }

  // ✅ DELETE
  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }

    const cat = await this.categoryModel.findByIdAndDelete(id);

    if (!cat) {
      throw new NotFoundException('Category not found');
    }

    return {
      message: 'Category deleted successfully',
    };
  }
}