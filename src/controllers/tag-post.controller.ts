import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  HttpErrors,
  param,
  patch,
  post,
  requestBody
} from '@loopback/rest';
import {
  Post,
  Tag
} from '../models';
import {PostRepository, TagRepository} from '../repositories';

export class TagPostController {
  constructor(
    @repository(TagRepository) protected tagRepository: TagRepository,
    @repository(PostRepository) protected postRepository: PostRepository,

  ) { }

  @get('/tags/{id}/posts', {
    responses: {
      '200': {
        description: 'Array of Tag has many Post through Category',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Post)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Post>,
  ): Promise<Post[]> {
    return this.tagRepository.posts(id).find(filter);
  }

  @post('/tags/{id}/posts', {
    responses: {
      '200': {
        description: 'create a Post model instance',
        content: {'application/json': {schema: getModelSchemaRef(Post)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Tag.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Post, {
            title: 'NewPostInTag',
            exclude: ['id'],
          }),
        },
      },
    }) post: Omit<Post, 'id'>,
  ): Promise<Post> {
    const existingPost = await this.postRepository.findOne({where: {id: post.id}});
    if (existingPost) {
      this.tagRepository.posts(id).link(existingPost.id);
      return existingPost;
    }
    return this.tagRepository.posts(id).create(post);
  }

  @patch('/tags/{id}/posts', {
    responses: {
      '200': {
        description: 'Tag.Post PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Post, {partial: true}),
        },
      },
    })
    post: Partial<Post>,
    @param.query.object('where', getWhereSchemaFor(Post)) where?: Where<Post>,
  ): Promise<Count> {
    return this.tagRepository.posts(id).patch(post, where);
  }

  @del('/tags/{id}/posts', {
    responses: {
      '200': {
        description: 'Tag.Post DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Post)) where?: Where<Post>,
  ): Promise<Count> {
    const existingPost = await this.postRepository.findById(id);
    if (!existingPost) {
      throw new HttpErrors.NotFound('Post not found');
    }
    const existingTag = await this.tagRepository.findOne({where});
    if (!existingTag) {
      throw new HttpErrors.NotFound('Tag not found');
    }
    await this.tagRepository.posts(id).unlink(existingPost.id);

    return {count: 1};
  }
}
