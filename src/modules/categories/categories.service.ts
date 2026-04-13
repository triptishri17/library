import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../../schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  private toSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  async findAll() {
    const categories = await this.categoryModel.find().sort({ name: 1 });
    return { data: categories };
  }

  async findOne(id: string) {
    const cat = await this.categoryModel.findById(id);
    if (!cat) throw new NotFoundException('Category not found');
    return { data: cat };
  }

  async create(dto: CreateCategoryDto) {
    const slug = this.toSlug(dto.name);
    const existing = await this.categoryModel.findOne({ slug });
    if (existing) throw new ConflictException('Category already exists');
    const category = await this.categoryModel.create({ ...dto, slug });
    return { data: category, message: 'Category created' };
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const updateData: any = { ...dto };
    if (dto.name) {
      updateData.slug = this.toSlug(dto.name);
      const existing = await this.categoryModel.findOne({ slug: updateData.slug, _id: { $ne: id } });
      if (existing) throw new ConflictException('Category name already in use');
    }
    const cat = await this.categoryModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!cat) throw new NotFoundException('Category not found');
    return { data: cat, message: 'Category updated' };
  }

  async remove(id: string) {
    const cat = await this.categoryModel.findByIdAndDelete(id);
    if (!cat) throw new NotFoundException('Category not found');
    return { message: 'Category deleted' };
  }
}
