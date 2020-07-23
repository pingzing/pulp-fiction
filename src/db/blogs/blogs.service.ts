import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
//import * as wordCounter from '@offprintstudios/word-counter';
import * as sanitize from 'sanitize-html';

import * as models from './models';
import { UsersService } from '../users/users.service';

@Injectable()
export class BlogsService {
    constructor(@InjectModel('Blog') private readonly blogModel: Model<models.Blog>,
        private readonly usersService: UsersService) {}

    /**
     * Creates a new blogpost and saves it to the database. Returns the newly
     * created blog as a promise.
     *
     * @param user The user making the blog.
     * @param newBlogInfo The blog's information.
     */
    async createNewBlog(user: any, newBlogInfo: models.CreateBlog): Promise<models.Blog> {
        const newBlog = new this.blogModel({
            author: user.sub,
            title: newBlogInfo.title,
            body: newBlogInfo.body,
            published: newBlogInfo.published});
        return await newBlog.save().then(async blog => {
            const blogCount = await this.blogModel.countDocuments({author: user.sub}).where('audit.isDeleted', false).where('published', true);
            await this.usersService.updateBlogCount(user.sub, blogCount);
            return blog;
        });
    }

    /**
     * Finds a blog by a given ID and returns it in a promise.
     *
     * @param blogId The incoming blog ID.
     */
    async findOneById(blogId: string): Promise<models.Blog> {
        return await this.blogModel.findById(blogId).where('audit.isDeleted', false);
    }

    /**
     * Fetches a user's blogs based on their user ID. Returns the array
     * as a promise.
     *
     * @param user The user whose blogs are being requested.
     */
    async fetchUserBlogs(user: any): Promise<models.Blog[]> {
        return await this.blogModel.find().where('author', user.sub).where('audit.isDeleted', false);
    }

    /**
     * Soft deletes a specific blog belonging to the specified user.
     * 
     * @param user The author of the blog
     * @param blogId The blog's ID
     */
    async deleteBlog(user: any, blogId: string): Promise<void> {
        await this.blogModel.findOneAndUpdate({"_id": blogId, "author": user.sub}, {"audit.isDeleted": true});
    }

    /**
     * Changes the publishing status of a specific blog belonging to the
     * specified user.
     * 
     * @param user The author of the blog
     * @param pubStatus The blog's ID and new publishing status
     */
    async setPublishStatus(user: any, pubStatus: models.SetPublishStatus): Promise<void> {
        await this.blogModel.findOneAndUpdate({"_id": pubStatus.blogId, "author": user.sub}, {"published": pubStatus.publishStatus}).then(async blog => {
            const blogCount = await this.blogModel.countDocuments({author: user.sub}).where('audit.isDeleted', false).where('published', true);
            await this.usersService.updateBlogCount(user.sub, blogCount);
        });
    }

    /**
     * Edits a given user's blog using the provided information in the EditBlog
     * model.
     * 
     * @param user The author of the blog
     * @param blogInfo The blog info for the update
     */
    async editBlog(user: any, blogInfo: models.EditBlog): Promise<void> {
        // const wordcount = await wordCounter.countWords(blogInfo.body);
        await this.blogModel.findOneAndUpdate(
            {"_id": blogInfo._id, "author": user.sub},
            {"title": sanitize(blogInfo.title), "body": sanitize(blogInfo.body), "published": blogInfo.published, /*"stats.words": wordcount*/}
            ).then(async blog => {
                const blogCount = await this.blogModel.countDocuments({author: user.sub}).where('audit.isDeleted', false).where('published', true);
                await this.usersService.updateBlogCount(user.sub, blogCount);
            });
    }

    /**
     * Fetching a user's published blogs for display in their portfolio.
     * 
     * @param userId The ID of the user whose blogs we're fetching
     */
    async getPubBlogList(userId: string): Promise<models.Blog[]> {
        return await this.blogModel.find().where('author', userId).where('published', true).where('audit.isDeleted', false);
    }

    /**
     * Queries the database for a blog matching the provided blog ID and returns it.
     * 
     * @param blogId The blog we're fetching
     */
    async getOneBlog(blogId: string): Promise<models.Blog> {
        return await this.blogModel.findById(blogId).where('published', true).where('audit.isDeleted', false);
    }
}
