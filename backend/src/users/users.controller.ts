// backend/src/users/users.controller.ts
import { Controller, Get, Put, UseGuards, Req, Body, Param, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    console.log('REQ.USER:', req.user);
    return this.usersService.findById(req.user.userId);
  }


  // @UseGuards(JwtAuthGuard)
  // @Get('profile')
  // async getProfile(@Req() req) {
  //   const userId = req.user.id;
  //   return this.usersService.findById(userId);
  // }

  @Put('profile')
  async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    return this.usersService.findOneByEmail(email);
  }
}