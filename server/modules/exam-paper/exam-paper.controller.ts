import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ExamPaperService } from './exam-paper.service';
import {
  PaperHotQueryDto,
  PaperListQueryDto,
  PaperRecentQueryDto,
  PaperSearchQueryDto,
} from './exam-paper.dto';

@Controller('api/papers')
export class ExamPaperController {
  constructor(private readonly examPaperService: ExamPaperService) {}

  @Get('hot')
  async getHotPapers(@Query() query: PaperHotQueryDto) {
    return this.examPaperService.getHotPapers(query.limit);
  }

  @Get('recent')
  async getRecentPapers(@Query() query: PaperRecentQueryDto) {
    return this.examPaperService.getRecentPapers(query.limit);
  }

  @Get('search')
  async searchPapers(@Query() query: PaperSearchQueryDto) {
    return this.examPaperService.searchPapers(query);
  }

  @Get(':id')
  async getPaperDetail(@Param('id') id: string) {
    return this.examPaperService.getPaperDetail(id);
  }

  @Get()
  async getPapers(@Query() query: PaperListQueryDto) {
    return this.examPaperService.getPapers(query);
  }

  @Post(':id/view')
  async incrementView(@Param('id') id: string) {
    return this.examPaperService.incrementView(id);
  }

  @Post(':id/download')
  async incrementDownload(@Param('id') id: string) {
    return this.examPaperService.incrementDownload(id);
  }
}
