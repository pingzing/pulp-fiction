import { Controller, UseGuards, Request, Param, Body, Get, Put, Patch } from '@nestjs/common';

import { RolesGuard } from '../../../guards';
import { Roles } from '@pulp-fiction/models/users';
import { CreateCollection, EditCollection } from '@pulp-fiction/models/collections';
import { CollectionsService } from '../../../db/collections/collections.service';

@Controller('collections')
export class CollectionsController {
    constructor(private readonly collsService: CollectionsService) {}

    @UseGuards(RolesGuard([Roles.User]))
    @Get('fetch-user-collections/:pageNum')
    async fetchUserCollections(@Request() req: any, @Param('pageNum') pageNum: number) {
        return await this.collsService.getUserCollections(req.user, pageNum);
    }

    @UseGuards(RolesGuard([Roles.User]))
    @Get('fetch-user-collections-no-paginate')
    async fetchUserCollectionsNoPaginate(@Request() req: any) {
        return await this.collsService.getUserCollectionsNoPaginate(req.user);
    }
    
    @UseGuards(RolesGuard([Roles.User]))
    @Put('create-collection')
    async createCollection(@Request() req: any, @Body() collInfo: CreateCollection) {
        return await this.collsService.createCollection(req.user.sub, collInfo);
    }

    @UseGuards(RolesGuard([Roles.User]))
    @Patch('edit-collection/:collId')
    async editCollection(@Request() req: any, @Param('collId') collId: string, @Body() collInfo: EditCollection) {
        return await this.collsService.editCollection(req.user, collId, collInfo);
    }

    @UseGuards(RolesGuard([Roles.User]))
    @Patch('delete-collection/:collId')
    async deleteCollection(@Request() req: any, @Param('collId') collId: string) {
        return await this.collsService.deleteCollection(req.user, collId);
    }

    @UseGuards(RolesGuard([Roles.User]))
    @Patch('add-work/:collId/:workId')
    async addWork(@Request() req: any, @Param('collId') collId: string, @Param('workId') workId: string) {
        return await this.collsService.addWorkToCollection(req.user, collId, workId);
    }

    @UseGuards(RolesGuard([Roles.User]))
    @Patch('remove-work/:collId/:workId')
    async removeWork(@Request() req: any, @Param('collId') collId: string, @Param('workId') workId: string) {
        return await this.collsService.removeWorkFromCollection(req.user, collId, workId);
    }

    @UseGuards(RolesGuard([Roles.User]))
    @Patch('set-public/:collId')
    async setPublic(@Request() req: any, @Param('collId') collId: string) {
        return await this.collsService.setPublic(req.user, collId);
    }

    @UseGuards(RolesGuard([Roles.User]))
    @Patch('set-private/:collId')
    async setPrivate(@Request() req: any, @Param('collId') collId: string) {
        return await this.collsService.setPrivate(req.user, collId);
    }
}
