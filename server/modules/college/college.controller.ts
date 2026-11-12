import { Controller, Get, Param, Query } from '@nestjs/common';
import { CollegeService } from './college.service';
import {
  CollegeCoursesQueryDto,
  CollegeListQueryDto,
} from './college.dto';

@Controller('api/colleges')
export class CollegeController {
  constructor(private readonly collegeService: CollegeService) {}

  @Get()
  async getColleges(@Query() _query: CollegeListQueryDto) {
    return this.collegeService.getColleges();
  }

  @Get('with-stats')
  async getCollegesWithStats() {
    return this.collegeService.getCollegesWithStats();
  }

  @Get(':id/subjects')
  async getSubjects(@Param('id') id: string) {
    return this.collegeService.getSubjects(id);
  }

  @Get(':id/courses')
  async getCourses(
    @Param('id') id: string,
    @Query() query: CollegeCoursesQueryDto,
  ) {
    return this.collegeService.getCourses(id, query);
  }
}
