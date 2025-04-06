import { Controller, Post, Body, UseGuards, Req, Get, Param } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ReviewService } from "./review.service";
import { CreateReviewDto } from "./dto/create-review.dto";

@Controller("reviews")
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async createReview(
        @Body() createReviewDto: CreateReviewDto,
        @Req() req,
    ) {
        const userId = req.user.userId;
        return this.reviewService.createReview(createReviewDto, userId);
    }

    @Get('listing/:id')
    async getListingReviews(@Param('id') listingId: number) {
        return this.reviewService.getReviewsByListing(listingId);
    }
}