import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseListQueryDto } from './course.dto';

@Controller('api/courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  async getCourses(@Query() query: CourseListQueryDto) {
    return this.courseService.getCourses(query);
  }

  @Get(':id')
  async getCourseDetail(@Param('id') id: string) {
    return this.courseService.getCourseDetail(id);
  }

  @Get(':id/papers')
  async getCoursePapers(@Param('id') id: string) {
    return this.courseService.getCoursePapers(id);
  }

  @Post(':id/view')
  async incrementView(@Param('id') id: string) {
    return this.courseService.incrementView(id);
  }
}
